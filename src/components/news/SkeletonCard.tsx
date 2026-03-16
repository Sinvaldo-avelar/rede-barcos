export default function SkeletonGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      
      {/* 1. TOPO (Manchete) */}
      <div className="mb-8 border-b border-gray-100 pb-8">
        <div className="h-3 bg-slate-200 w-20 mb-4"></div>
        <div className="h-12 bg-slate-200 w-full mb-4"></div>
        <div className="h-4 bg-slate-200 w-2/3"></div>
      </div>

      {/* 2. GRID TRIPARTIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Esquerda (Só texto) */}
        <div className="lg:col-span-3 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-50 pb-4">
              <div className="h-2 bg-slate-200 w-16 mb-2"></div>
              <div className="h-5 bg-slate-200 w-full mb-2"></div>
              <div className="h-3 bg-slate-200 w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Meio (Slider) */}
        <div className="lg:col-span-6">
          <div className="bg-slate-200 aspect-square md:aspect-video w-full rounded-sm"></div>
        </div>

        {/* Direita (Fotos pequenas) */}
        <div className="lg:col-span-3 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border-b border-gray-100 pb-6">
              <div className="w-20 h-20 bg-slate-200 flex-shrink-0"></div>
              <div className="flex-1 pt-2">
                <div className="h-2 bg-slate-200 w-16 mb-2"></div>
                <div className="h-4 bg-slate-200 w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}