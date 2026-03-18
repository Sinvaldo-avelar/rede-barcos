"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, UploadCloud, Tag, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Carregando matéria...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 text-slate-800",
      },
    },
  });

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
        alert("Notícia não encontrada para edição.");
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
      editor?.commands.setContent(data.conteudo || "<p></p>");
      setCarregandoDados(false);
    }

    if (isMounted && editor) {
      carregarNoticia();
    }
  }, [editor, isMounted, noticiaId, router]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("noticias_fotos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("noticias_fotos")
        .getPublicUrl(fileName);

      setImagemUrl(urlData.publicUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verifique o console";
      alert("Erro no upload: " + message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor || !titulo || !noticiaId) return;

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
      alert("Erro ao atualizar notícia: " + error.message);
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
                <option value="Brasil">Brasil</option>
                <option value="Geral">Geral</option>
                <option value="Conceição da Barra">Conceição da Barra</option>
                <option value="Política">Política</option>
                <option value="Polícia">Polícia</option>
                <option value="Esportes">Esportes</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Subtítulo ou Chamada</label>
              <input
                type="text"
                className="w-full px-0 py-2 text-lg text-slate-500 border-b border-slate-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
                placeholder="Um resumo rápido para atrair o leitor..."
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
              />
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
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">Foto de Capa da Notícia</label>
              <div className="flex items-center gap-6">
                <div className="relative w-40 h-28 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                  {previewUrl ? (
                    <Image src={previewUrl} fill className="object-cover" alt="Preview" unoptimized />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                    <UploadCloud size={18} />
                    {uploading ? "Enviando..." : "Trocar Imagem"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                  </label>
                  <p className="text-[11px] text-slate-400">Recomendado: 1200x800px (JPG ou PNG)</p>
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Crédito / Legenda da Imagem</label>
                    <input
                      type="text"
                      placeholder="Ex: Foto: João Silva / Jornal O Dia"
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
            <MenuBar editor={editor} />
            <div className="bg-white">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          <button
            type="submit"
            disabled={carregando || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {carregando ? "Salvando..." : <><Save size={20} /> Atualizar Matéria</>}
          </button>
        </div>
      </form>
    </div>
  );
}