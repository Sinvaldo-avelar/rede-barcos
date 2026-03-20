"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadImageToSupabase } from "@/lib/upload";
import ImageEditorModal from "@/components/ui/ImageEditorModal";
import MediaGalleryModal from "@/components/ui/MediaGalleryModal";
import SimpleToast from "@/components/ui/SimpleToast";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, UploadCloud, Tag, LayoutDashboard, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapImage from "@tiptap/extension-image";
import type { Editor } from "@tiptap/react";
import DOMPurify from "dompurify";

type CropContexto = "capa" | "conteudo";
type AIAction = "improve" | "summarize" | "generate_seo" | "command" | "generate_tags";

const MenuBar = ({
  editor,
  onInsertImage,
  uploadingImage,
  onAiAction,
  aiLoading,
}: {
  editor: Editor | null;
  onInsertImage: () => void;
  uploadingImage: boolean;
  onAiAction: (action: AIAction) => Promise<void>;
  aiLoading: boolean;
}) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded hover:bg-slate-100 transition-colors ${active ? "bg-blue-100 text-blue-600" : "text-slate-600"}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 rounded-t-xl">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} title="Negrito"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} title="Itálico"><Italic size={18} /></button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} title="Título 1"><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Título 2"><Heading2 size={18} /></button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} title="Lista de Bolinhas"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} title="Lista Numerada"><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} title="Citação"><Quote size={18} /></button>
      <button type="button" onClick={onInsertImage} disabled={uploadingImage} className={btnClass(false)} title="Inserir Imagem"><ImageIcon size={18} /></button>
      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
      <button type="button" onClick={() => onAiAction("improve")} disabled={aiLoading} className={btnClass(false)} title="IA: Reescrever">✍️</button>
      <button type="button" onClick={() => onAiAction("summarize")} disabled={aiLoading} className={btnClass(false)} title="IA: Resumir">🧠</button>
      <button type="button" onClick={() => onAiAction("generate_seo")} disabled={aiLoading} className={btnClass(false)} title="IA: Sugerir título e meta description"><Sparkles size={18} /></button>
    </div>
  );
};

export default function EditarNoticiaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const noticiaId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isMounted, setIsMounted] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [posicao, setPosicao] = useState("lateral");
  const [imagemUrl, setImagemUrl] = useState("");
  const [legendaImagem, setLegendaImagem] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<{ src: string; contexto: CropContexto } | null>(null);
  const [openGaleriaContexto, setOpenGaleriaContexto] = useState<CropContexto | null>(null);
  const [conteudoPreview, setConteudoPreview] = useState("<p>Carregando matéria...</p>");
  const [aiLoading, setAiLoading] = useState(false);
  const [comandoIA, setComandoIA] = useState("Escreva uma notícia completa baseada nestes fatos:");
  const [tagsSugeridas, setTagsSugeridas] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error" | "warning">("success");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: "<p>Carregando matéria...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setConteudoPreview(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 text-slate-800",
      },
    },
  });

  async function lerArquivoComoDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem selecionada."));
      reader.readAsDataURL(file);
    });
  }

  async function abrirCropComArquivo(file: File, contexto: CropContexto) {
    const src = await lerArquivoComoDataUrl(file);
    setCropState({ src, contexto });
  }

  function abrirCropComUrl(url: string, contexto: CropContexto) {
    setCropState({ src: url, contexto });
  }

  function handleInsertImagemNoConteudo() {
    setOpenGaleriaContexto("conteudo");
  }

  function handleEscolherCapaDaMidia() {
    setOpenGaleriaContexto("capa");
  }

  useEffect(() => {
    async function carregarNoticia() {
      if (!noticiaId) {
        router.replace("/admin/noticias");
        return;
      }

      setCarregandoDados(true);

      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("id", noticiaId)
        .maybeSingle();

      if (error || !data) {
        setToastVariant("error");
        setToastMessage("Erro na IA");
        router.replace("/admin/noticias");
        return;
      }

      setTitulo(data.titulo || "");
      setSubtitulo(data.subtitulo || "");
      setCategoria(data.categoria || "Geral");
      setPosicao(["principal", "lateral", "slider", "feed"].includes(data.posicao) ? data.posicao : "lateral");
      setImagemUrl(data.imagem_url || "");
      setLegendaImagem(data.legenda_imagem || "");
      setPreviewUrl(data.imagem_url || null);
      setConteudoPreview(data.conteudo || "<p></p>");
      editor?.commands.setContent(data.conteudo || "<p></p>");
      setCarregandoDados(false);
    }

    if (isMounted && editor) {
      carregarNoticia();
    }
  }, [editor, isMounted, noticiaId, router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    await abrirCropComArquivo(file, "capa");
  }

  async function handleSaveEditedImage(blob: Blob, fileName: string) {
    if (!cropState) return;

    try {
      setUploading(true);
      const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
      const { publicUrl } = await uploadImageToSupabase({ file, prefix: "editada" });

      if (cropState.contexto === "capa") {
        setImagemUrl(publicUrl);
        setPreviewUrl(publicUrl);
      } else {
        editor
          ?.chain()
          .focus()
          .setImage({ src: publicUrl, alt: "Imagem do conteúdo", title: "Imagem do conteúdo" })
          .run();
      }

      setCropState(null);
    } catch {
      setToastVariant("error");
      setToastMessage("Erro na IA");
    } finally {
      setUploading(false);
    }
  }

  function textoParaHtml(texto: string) {
    const escaparHtml = (valor: string) =>
      valor
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    return texto
      .split(/\n{2,}/)
      .map((bloco) => `<p>${escaparHtml(bloco).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  async function handleAiAction(action: AIAction) {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const textoSelecionado = editor.state.doc.textBetween(from, to, "\n", "\n").trim();
    const textoCompleto = editor.getText().trim();
    const textoBase = (textoSelecionado || textoCompleto).trim();

    if (!textoBase) {
      setToastVariant("error");
      setToastMessage("Preencha os campos");
      return;
    }

    if (action === "command" && !comandoIA.trim()) {
      setToastVariant("error");
      setToastMessage("Preencha os campos");
      return;
    }

    try {
      setAiLoading(true);
      const response = await fetch("/api/ai/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: textoBase,
          titulo,
          subtitulo,
          categoria,
          customCommand:
            action === "generate_tags"
              ? "Gere 5 tags de SEO separadas apenas por vírgulas"
              : comandoIA,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const details = result?.details ? ` ${String(result.details)}` : "";
        throw new Error(`${result?.error || "Falha ao processar com IA."}${details}`.trim());
      }

      if (action === "generate_seo") {
        if (result?.data?.titulo) setTitulo(result.data.titulo);
        if (result?.data?.metaDescription) setSubtitulo(result.data.metaDescription);
        return;
      }

      if (action === "generate_tags") {
        const tags = Array.isArray(result?.data?.tags)
          ? result.data.tags.map((item: unknown) => String(item || "").trim()).filter(Boolean).slice(0, 5)
          : [];

        if (tags.length === 0) {
          throw new Error("A IA não retornou tags válidas.");
        }

        setTagsSugeridas(tags);
        try {
          await navigator.clipboard.writeText(tags.join(", "));
          setToastVariant("success");
          setToastMessage("Tags copiadas!");
        } catch {
          setToastVariant("error");
          setToastMessage("Falha ao copiar");
        }
        return;
      }

      const novoTexto = String(result?.data?.text || "").trim();
      if (!novoTexto) {
        throw new Error("A IA não retornou texto.");
      }

      if (action === "command") {
        editor.commands.setContent(textoParaHtml(novoTexto), false);
        setToastVariant("success");
        setToastMessage("Matéria gerada!");
      } else if (textoSelecionado) {
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent(novoTexto)
          .run();
      } else {
        editor.commands.setContent(textoParaHtml(novoTexto), false);
      }
    } catch {
      setToastVariant("error");
      setToastMessage("Erro na IA");
    } finally {
      setAiLoading(false);
    }
  }

  function handleLimparEditor() {
    setTitulo("");
    setTagsSugeridas([]);
    editor?.commands.setContent("<p></p>", false);
    setConteudoPreview("<p></p>");
    setToastVariant("warning");
    setToastMessage("Campos limpos para uma nova notícia!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor || !titulo || !noticiaId) {
      setToastVariant("error");
      setToastMessage("Preencha os campos");
      return;
    }

    setCarregando(true);

    if (posicao === "principal") {
      await supabase.from("noticias").update({ posicao: "lateral" }).eq("posicao", "principal").neq("id", noticiaId);
    }

    const { error } = await supabase
      .from("noticias")
      .update({
        titulo,
        subtitulo,
        categoria,
        posicao,
        conteudo: editor.getHTML(),
        imagem_url: imagemUrl,
        legenda_imagem: legendaImagem,
      })
      .eq("id", noticiaId);

    if (error) {
      setToastVariant("error");
      setToastMessage("Erro na IA");
    } else {
      router.push("/admin/noticias");
      router.refresh();
    }

    setCarregando(false);
  }

  if (!isMounted) return null;

  if (carregandoDados) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  const DOMINIOS_IMAGEM_CONFIAVEIS = ["supabase.co"];
  const RESTRINGIR_IMAGEM_A_DOMINIOS_CONFIAVEIS = false;

  const isImagemSrcPermitido = (src: string) => {
    if (!src?.startsWith("https://")) return false;

    if (!RESTRINGIR_IMAGEM_A_DOMINIOS_CONFIAVEIS) {
      return true;
    }

    try {
      const { hostname } = new URL(src);
      return DOMINIOS_IMAGEM_CONFIAVEIS.some(
        (dominio) => hostname === dominio || hostname.endsWith(`.${dominio}`)
      );
    } catch {
      return false;
    }
  };

  DOMPurify.removeHooks("uponSanitizeAttribute");
  DOMPurify.addHook("uponSanitizeAttribute", (currentNode, data) => {
    if (
      currentNode.tagName?.toLowerCase() === "img" &&
      data.attrName?.toLowerCase() === "src" &&
      !isImagemSrcPermitido(data.attrValue)
    ) {
      data.keepAttr = false;
    }
  });

  const conteudoPreviewSanitizado = DOMPurify.sanitize(conteudoPreview, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "h2", "h3", "ul", "ol", "li", "a", "img"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
  DOMPurify.removeHooks("uponSanitizeAttribute");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Link href="/admin/noticias" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
        <ArrowLeft size={18} /> Voltar para a lista
      </Link>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Notícia</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8 border-b border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Título Principal</label>
              <input
                type="text"
                required
                className="w-full px-0 py-2 text-3xl font-bold border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                placeholder="Título da notícia..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                <Tag size={14} /> Selecione a Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
              >
                <option value="Espírito Santo">Espírito Santo</option>
                <option value="Geral">Geral</option>
                <option value="Política">Política</option>
                <option value="Brasil">Brasil</option>
                <option value="Polícia">Polícia</option>
                <option value="Esportes">Esportes</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Subtítulo ou Chamada</label>
              <textarea
                rows={2}
                className="w-full px-0 py-2 text-lg text-slate-500 border-b border-slate-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 resize-none font-medium italic"
                placeholder="Um resumo rápido para atrair o leitor..."
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Comando para IA</label>
              <textarea
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="Ex: Escreva uma notícia completa baseada nestes fatos:"
                value={comandoIA}
                onChange={(e) => setComandoIA(e.target.value)}
              />
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiAction("generate_tags")}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-50"
                  >
                    Gerar e Copiar Tags
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiAction("command")}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-50"
                  >
                    <Sparkles size={14} /> Executar Comando IA
                  </button>
                </div>
              </div>
              {tagsSugeridas.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tagsSugeridas.map((tagItem, index) => (
                    <span
                      key={`${tagItem}-${index}`}
                      className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 text-xs font-bold"
                    >
                      {tagItem}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest"><LayoutDashboard size={14} /> Posição no Site</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: "principal", label: "Principal" }, { id: "slider", label: "Slider" }, { id: "lateral", label: "Lateral" }, { id: "feed", label: "Feed" }].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setPosicao(op.id)}
                    className={`p-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${posicao === op.id ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-white bg-white text-slate-400 hover:border-slate-200"}`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tema define a editoria da notícia. Posição define onde ela aparece na capa (Principal, Slider, Lateral ou Feed).
            </p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">Imagem de Capa da Notícia</label>
              <div className="flex items-center gap-6">
                <div className="relative w-40 h-28 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {previewUrl ? (
                    <Image src={previewUrl} fill className="object-cover" alt="Preview" unoptimized />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                      <UploadCloud size={18} />
                      {uploading ? "Enviando..." : "Upload do Computador"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>

                    <button
                      type="button"
                      onClick={handleEscolherCapaDaMidia}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                    >
                      Escolher do Acervo
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Recomendado: 1200x800px (JPG ou PNG)</p>
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">URL Pública da Imagem de Capa</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                      value={imagemUrl}
                      onChange={(e) => {
                        setImagemUrl(e.target.value);
                        setPreviewUrl(e.target.value || null);
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Crédito / Legenda da Imagem</label>
                    <input
                      type="text"
                      placeholder="Ex: Imagem: João Silva / Jornal O Dia"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                      value={legendaImagem}
                      onChange={(e) => setLegendaImagem(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <MenuBar
              editor={editor}
              onInsertImage={handleInsertImagemNoConteudo}
              uploadingImage={uploading}
              onAiAction={handleAiAction}
              aiLoading={aiLoading}
            />
            <div className="bg-white">
              <EditorContent editor={editor} />
            </div>
            {aiLoading && (
              <p className="px-6 pb-4 text-xs font-semibold text-blue-600">Processando com IA...</p>
            )}
          </div>

          <div className="border-t border-slate-100 p-8 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Prévia Pública da Matéria</p>

            <article className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-2xl border border-slate-200">
              <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] px-2 py-1 bg-blue-50 rounded">
                {categoria || "Geral"}
              </span>

              <h1 className="font-headline text-3xl md:text-5xl font-black leading-tight text-slate-900 mt-6 mb-6 tracking-tight">
                {titulo || "Título da notícia"}
              </h1>

              {(previewUrl || imagemUrl) && (
                <div className="mt-6">
                  <div className="relative w-full aspect-video overflow-hidden rounded-sm bg-slate-100 shadow-sm">
                    <Image
                      src={previewUrl || imagemUrl}
                      alt={titulo || "Imagem de capa"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 896px) 100vw, 896px"
                      unoptimized
                    />
                  </div>
                  {legendaImagem && (
                    <p className="mt-2 text-xs text-slate-500 leading-tight">
                      {legendaImagem}
                    </p>
                  )}
                </div>
              )}

              <div
                className="news-content mt-8 max-w-none space-y-4 font-(family-name:--font-playfair) leading-relaxed text-slate-800"
                dangerouslySetInnerHTML={{ __html: conteudoPreviewSanitizado }}
              />
            </article>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={handleLimparEditor}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Trash2 size={18} /> Limpar Editor
          </button>
          <button
            type="submit"
            disabled={carregando || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {carregando ? "Salvando..." : <><Save size={20} /> Atualizar Matéria</>}
          </button>
        </div>
      </form>

      <ImageEditorModal
        open={Boolean(cropState)}
        imageSrc={cropState?.src || null}
        onClose={() => setCropState(null)}
        onSave={handleSaveEditedImage}
      />

      <MediaGalleryModal
        open={Boolean(openGaleriaContexto)}
        onClose={() => setOpenGaleriaContexto(null)}
        onSelectImage={(imageUrl) => {
          if (!openGaleriaContexto) return;
          abrirCropComUrl(imageUrl, openGaleriaContexto);
        }}
        onUploadNew={async (file) => {
          if (!openGaleriaContexto) return;
          await abrirCropComArquivo(file, openGaleriaContexto);
        }}
        disabled={uploading}
      />

      <SimpleToast
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}