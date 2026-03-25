export const decades = [
  { label: "1985–1994", start: 1985, end: 1994 },
  { label: "1995–2004", start: 1995, end: 2004 },
  { label: "2005–2014", start: 2005, end: 2014 },
  { label: "2015–2024", start: 2015, end: 2024 },
];

interface Props {
  baseline: string;
  setBaseline: (v: string) => void;
  comparison: string;
  setComparison: (v: string) => void;
}

export function DecadePicker({ baseline, setBaseline, comparison, setComparison }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1 space-y-2">
        <label className="text-gray-400 font-mono text-sm tracking-wider">BASELINE ORIGIN</label>
        <select 
          value={baseline}
          onChange={(e) => setBaseline(e.target.value)}
          className="input-field appearance-none bg-glass-bg border-glass-border hover:border-cyan text-white cursor-pointer"
        >
          {decades.map(d => <option key={d.label} value={d.label} className="bg-background">{d.label}</option>)}
        </select>
      </div>
      <div className="flex-1 space-y-2">
        <label className="text-gray-400 font-mono text-sm tracking-wider">COMPARISON VECTOR</label>
        <select 
          value={comparison}
          onChange={(e) => setComparison(e.target.value)}
          className="input-field appearance-none bg-glass-bg border-glass-border hover:border-amber text-white cursor-pointer"
        >
          {decades.map(d => <option key={d.label} value={d.label} className="bg-background">{d.label}</option>)}
        </select>
      </div>
    </div>
  );
}
