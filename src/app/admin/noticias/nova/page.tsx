"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Image as ImageIcon, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, UploadCloud, Tag, LayoutDashboard } from "lucide-react";
import Link from "next/link";

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import { Table as TipTapTable } from '@tiptap/extension-table';
import TipTapTableRow from '@tiptap/extension-table-row';
import TipTapTableCell from '@tiptap/extension-table-cell';
import TipTapTableHeader from '@tiptap/extension-table-header';
import type { Editor } from '@tiptap/react';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  const btnClass = (active: boolean) => 
    `p-2 rounded hover:bg-slate-100 transition-colors ${active ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`;

  // Função para inserir imagem via URL
  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  // Função para inserir link
  const setLink = () => {
    const url = window.prompt('URL do link:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  // Função para inserir tabela
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 rounded-t-xl">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Negrito"><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Itálico"><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Sublinhado"><u>U</u></button>
      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Título 1"><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Título 2"><Heading2 size={18} /></button>
      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lista de Bolinhas"><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Lista Numerada"><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Citação"><Quote size={18} /></button>
      <button type="button" onClick={addImage} className={btnClass(false)} title="Inserir Imagem"><ImageIcon size={18} /></button>
      <button type="button" onClick={setLink} className={btnClass(editor.isActive('link'))} title="Inserir Link">🔗</button>
      <button type="button" onClick={addTable} className={btnClass(false)} title="Inserir Tabela">📋</button>
    </div>
  );
};

export default function NovaNoticia() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState("");
  const [posicao, setPosicao] = useState("lateral");
  const [imagemUrl, setImagemUrl] = useState(""); 
  const [legendaImagem, setLegendaImagem] = useState(""); // <-- NOVO ESTADO PARA O CRÉDITO
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      TipTapLink,
      TipTapTable.configure({ resizable: true }),
      TipTapTableRow,
      TipTapTableCell,
      TipTapTableHeader,
    ],
    content: '<p>Comece a escrever o conteúdo da matéria aqui...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 text-slate-800' },
    },
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('noticias_fotos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('noticias_fotos').getPublicUrl(fileName);
      if (urlData) { setImagemUrl(urlData.publicUrl); setPreviewUrl(URL.createObjectURL(file)); }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'erro desconhecido';
      alert('Erro no upload: ' + message);
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editor || !titulo || !subtitulo) {
        alert("Por favor, preencha o Título e o Subtítulo.");
        return;
    }

    setCarregando(true);
    const categoriaFinal = categoria === "Outra" ? categoriaPersonalizada : categoria;

    if (posicao === 'principal') {
      await supabase.from("noticias").update({ posicao: 'lateral' }).eq('posicao', 'principal');
    }

    const { error } = await supabase.from("noticias").insert([{ 
      titulo, 
      subtitulo, 
      categoria: categoriaFinal, 
      conteudo: editor.getHTML(), 
      imagem_url: imagemUrl, 
      legenda_imagem: legendaImagem, // <-- SALVANDO O CRÉDITO NO BANCO
      posicao: posicao 
    }]);

    if (error) { alert("Erro ao salvar: " + error.message); } 
    else { router.push("/admin/noticias"); router.refresh(); }
    setCarregando(false);
  }

  if (!isMounted) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Link href="/admin/noticias" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm">
        <ArrowLeft size={18} /> Voltar para a lista
      </Link>

      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Redação de Notícia</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="p-8 space-y-8 border-b border-slate-100">
            {/* TÍTULO PRINCIPAL */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-blue-600 mb-2 tracking-widest">Título da Matéria</label>
              <input 
                type="text" required
                className="w-full px-0 py-2 text-4xl font-black border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 text-slate-900"
                placeholder="Ex: Título da notícia..."
                value={titulo} onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* SUBTÍTULO */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Subtítulo (O resumo que aparece na capa)</label>
              <textarea 
                required
                rows={2}
                className="w-full px-0 py-2 text-xl text-slate-500 border-b border-slate-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 resize-none font-medium italic"
                placeholder="Um resumo que instigue o leitor..."
                value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)}
              />
            </div>

            {/* POSIÇÃO E CATEGORIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest"><LayoutDashboard size={14} /> Posição no Site</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{id:'principal', label:'Principal'}, {id:'slider', label:'Slider'}, {id:'lateral', label:'Lateral'}, {id:'feed', label:'Feed'}].map((op) => (
                      <button
                        key={op.id} type="button" onClick={() => setPosicao(op.id)}
                        className={`p-3 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${posicao === op.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-white bg-white text-slate-400 hover:border-slate-200'}`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest"><Tag size={14} /> Assunto da Notícia</label>
                  <select 
                    value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Espírito Santo">Espírito Santo</option>
                    <option value="Política">Política</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Esporte">Esporte</option>
                    <option value="Outra">Outra...</option>
                  </select>
                  {categoria === "Outra" && (
                    <input 
                      type="text" placeholder="Qual o novo tema?"
                      className="w-full bg-white border-b-2 border-blue-400 p-2 font-bold text-blue-700 outline-none"
                      value={categoriaPersonalizada} onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                    />
                  )}
                </div>
            </div>

            {/* FOTO DE CAPA COM CAMPO DE CRÉDITO */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-4 tracking-widest">Imagem de Destaque</label>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-48 h-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                  {previewUrl ? <Image src={previewUrl} fill className="object-cover" alt="Preview" unoptimized /> : <ImageIcon className="text-slate-300" size={32} />}
                </div>
                
                <div className="space-y-4 w-full">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20">
                    <UploadCloud size={18} /> {uploading ? "Enviando..." : "Escolher Foto"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                  </label>

                  {/* CAMPO DE LEGENDA / CRÉDITO */}
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

        <div className="flex justify-end">
          <button 
            type="submit" disabled={carregando || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {carregando ? "Publicando..." : <><Save size={20} /> PUBLICAR MATÉRIA AGORA</>}
          </button>
        </div>
      </form>
    </div>
  );
}