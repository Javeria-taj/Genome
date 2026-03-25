import { ReactNode } from "react";

export function StatCard({ title, value, icon, subtext, highlight }: { title: string, value: string | ReactNode, icon: ReactNode, subtext?: string, highlight?: boolean }) {
  return (
    <div className={`glass-panel p-5 transition-all w-full relative overflow-hidden group ${highlight ? 'border-cyan shadow-[0_0_15px_rgba(0,229,255,0.15)] bg-cyan/5' : ''}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 text-cyan">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 font-medium text-sm drop-shadow-md">{title}</h3>
        <div className="text-cyan">{icon}</div>
      </div>
      <div className="text-2xl font-bold font-sans text-glow tracking-tight text-white relative z-10">{value}</div>
      {subtext && <div className="text-xs text-gray-400 mt-2 font-mono opacity-80 relative z-10">{subtext}</div>}
    </div>
  );
}
