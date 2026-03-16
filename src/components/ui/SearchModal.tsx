"use client"

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // Fechar ao apertar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Background desfoque */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Caixa de Busca */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        <div className="flex items-center p-5 border-b dark:border-slate-800">
          <Search className="w-6 h-6 text-slate-400 mr-4" />
          <input 
            autoFocus
            type="text" 
            placeholder="O que você está procurando?" 
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Resultados Sugeridos (Placeholder) */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
            Sugestões
          </p>
          <div className="space-y-1">
            {["IA em 2026", "Economia Brasileira", "Novos iPhones"].map((item) => (
              <div key={item} className="p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}