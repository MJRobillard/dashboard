import React from 'react';

export type MeterKey = 'RSF' | 'CMS';

interface CrowdMeterCardProps {
  percentFull: number | null;
  selectedMeter: MeterKey;
  setSelectedMeter: (v: MeterKey) => void;
  METER_CONFIG: Record<string, { displayName: string; apiToken: string }>;
}

const CrowdMeterCard: React.FC<CrowdMeterCardProps> = ({ percentFull, selectedMeter, setSelectedMeter, METER_CONFIG }) => (
  <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold m-0">
          {METER_CONFIG[selectedMeter].displayName} Crowd Meter
        </h3>
        <div className="flex gap-2">
          {Object.keys(METER_CONFIG).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedMeter(key as MeterKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                selectedMeter === key
                  ? 'bg-yellow-300 text-blue-950 border-yellow-300'
                  : 'bg-slate-700/50 text-yellow-300 border-yellow-300/30 hover:bg-yellow-300/10'
              }`}
            >
              {METER_CONFIG[key].displayName}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#facc15"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - (percentFull ?? 0) / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-yellow-300 drop-shadow-lg">
              {percentFull !== null ? `${percentFull}%` : <span className="text-lg text-white/70">--</span>}
            </span>
            <span className="text-white/70 text-lg mt-1">Full</span>
          </div>
        </div>
        <div className="mt-4 text-white/60 text-sm text-center max-w-xs">
          Live crowd meter for {METER_CONFIG[selectedMeter].displayName}. Data updates automatically.
        </div>
      </div>
    </div>
  </div>
);

export default CrowdMeterCard; 