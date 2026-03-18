"use client"

import Image from 'next/image'
import { useState, useRef } from 'react'
import { Play, Volume2 } from 'lucide-react'

const RADIOS = [
  {
    id: 'barcos',
    name: 'REDE BARCOS FM',
    logo: '/barcos.png', 
    url: 'https://rvn01.painelstream.net:9022/stream/'
  },
  {
    id: 'barra',
    name: 'BARRA FM 98.1',
    logo: '/barra.png',
    url: 'https://rvn01.painelstream.net:8484/stream/'
  }
]

export function RadioDock() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleRadio = (radio: typeof RADIOS[0]) => {
    if (playingId === radio.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      setPlayingId(radio.id)
      if (audioRef.current) {
        audioRef.current.src = radio.url
        audioRef.current.play().catch(() => {})
      }
    }
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-65 md:max-w-70 xl:w-29.5 xl:max-w-none z-100 
            flex flex-col xl:items-center gap-1 p-2 md:p-2.5 xl:p-2 
                    bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl 
                    rounded-3xl xl:rounded-4xl border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-500
            xl:fixed xl:top-1/2 xl:bottom-auto xl:left-auto xl:right-4 xl:translate-x-0 xl:-translate-y-1/2">
      
      {/* 🎙️ CHAMADA: Fica ao lado no mobile e em cima no PC */}
      <div className="flex flex-row xl:flex-col items-center justify-center gap-1 mb-0.5 px-1">
        <Volume2 size={12} className="text-blue-600 animate-pulse" />
        <span className="text-[7px] md:text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest text-center leading-tight">
          Ouça <br className="hidden xl:block" /> agora a sua <br />radio
        </span>
      </div>

      {/* 🚀 A MUDANÇA: flex-row no mobile | xl:flex-col no PC */}
      <div className="flex flex-row xl:flex-col gap-2 md:gap-3 xl:gap-2.5">
        {RADIOS.map((radio) => (
          <div key={radio.id} className="relative group flex flex-col items-center">
            
            <button
              onClick={() => toggleRadio(radio)}
              /* Botão menor no mobile (h-14) para não esconder nada */
              className={`relative h-10 w-10 md:h-16 md:w-16 xl:h-20 xl:w-20 rounded-full xl:rounded-3xl overflow-hidden transition-all duration-500 border-2 md:border-[3px] shadow-lg active:scale-95 bg-white
                ${playingId === radio.id 
                  ? 'border-blue-500 scale-105' 
                  : 'border-slate-100 hover:border-blue-400'
                }`}
            >
              <Image 
                src={radio.logo}
                alt={radio.name}
                fill
                className={`object-contain p-1.5 md:p-3 transition-all duration-700 
                  ${playingId === radio.id ? 'brightness-75' : 'brightness-100'}`}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                {playingId === radio.id ? (
                  <div className="flex gap-0.5 md:gap-1 items-end h-4 md:h-6">
                    <div className="w-1 md:w-1.5 bg-blue-600 animate-bounce rounded-full"></div>
                    <div className="w-1 md:w-1.5 bg-blue-600 animate-bounce rounded-full"></div>
                    <div className="w-1 md:w-1.5 bg-blue-600 animate-bounce rounded-full"></div>
                  </div>
                ) : (
                  <div className="bg-black/10 inset-0 absolute opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <Play className="text-blue-600 fill-blue-600 w-4 h-4 md:w-7 md:h-7" />
                  </div>
                )}
              </div>
            </button>
            
            {/* Nome oculto no mobile para ganhar espaço, aparece no PC */}
            <span className="hidden xl:block text-[8px] font-bold text-slate-500 uppercase mt-1">
              {radio.id === 'barcos' ? 'Barcos' : 'Barra'}
            </span>
          </div>
        ))}
      </div>

      <audio ref={audioRef} />
    </div>
  )
}