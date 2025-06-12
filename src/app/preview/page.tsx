import React from 'react';


// Original CardFour
const CardFour = () => (
  <div className="relative rounded-2xl p-6 backdrop-blur-md bg-gradient-to-br from-blue-950 via-sky-900 to-blue-800 shadow-[inset_0_0_30px_rgba(96,165,250,0.2),_0_0_30px_rgba(234,179,8,0.2)] border border-yellow-300/40 overflow-hidden">
    <div className="absolute -inset-1 rounded-[24px] pointer-events-none">
      <svg width="100%" height="100%">
        <defs>
          <linearGradient id="card4-neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <filter id="glow4" x="-100%" y="-100%" width="300%" height="300%">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="spark" />
            <feDisplacementMap in="SourceGraphic" in2="spark" scale="7" />
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fde047" floodOpacity="0.75" />
          </filter>
        </defs>
        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="24" ry="24"
          fill="none" stroke="url(#card4-neon)" strokeWidth="2.5" filter="url(#glow4)" strokeDasharray="3 6" />
      </svg>
    </div>
    <div className="relative z-10 text-white">
      <h2 className="text-xl font-semibold text-yellow-300 mb-2">⚙️ Card Four: Config Center</h2>
      <p className="text-sm text-white/75">
        Adjust, tune, and preview features in a power-user friendly control zone. Every interaction radiates clarity.
      </p>
    </div>
  </div>
);

const CardFourG = () => (
    <div className="relative rounded-2xl p-6 bg-gradient-to-tl from-blue-950 via-blue-900 to-blue-950 shadow-[0_0_35px_rgba(253,224,71,0.1),inset_0_0_20px_rgba(255,255,255,0.04)] border border-yellow-200/20 overflow-hidden">
      <div className="absolute -inset-1 rounded-[24px] pointer-events-none bg-[radial-gradient(circle_at_top_center,rgba(253,224,71,0.1)_0%,transparent_70%)]" />
      <div className="relative z-10 text-yellow-300">
        <h2 className="text-xl font-semibold mb-2">⚙️ Spotlight Settings</h2>
        <p className="text-sm text-white/65">
          A crisp center light casts clarity on your golden interface.
        </p>
      </div>
    </div>
  );
  
  // Variant H – Radiant Glass Shell
  const CardFourH = () => (
    <div className="relative rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800 border border-yellow-300/40 shadow-[inset_0_0_20px_rgba(253,224,71,0.05),0_0_20px_rgba(253,224,71,0.15)] overflow-hidden">
      <div className="absolute inset-0 bg-yellow-100/5 pointer-events-none rounded-2xl" />
      <div className="relative z-10 text-yellow-300">
        <h2 className="text-xl font-bold mb-2">⚙️ Radiant Shell</h2>
        <p className="text-sm text-white/70">
          Polished, weightless interface surrounded by shimmering dusk.
        </p>
      </div>
    </div>
  );


export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">Card Components Preview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <CardFour />

          <CardFourG />
          <CardFourH />

        </div>
      </div>
    </div>
  );
}
