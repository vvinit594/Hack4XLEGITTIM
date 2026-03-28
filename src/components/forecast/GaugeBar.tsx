import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GaugeBarProps = {
  value: number; // Percentage (0-100)
  absoluteValue: number; // e.g. "36 beds"
  label: string; // "4h Forecast" / "8h Forecast"
};

export function GaugeBar({ value, absoluteValue, label }: GaugeBarProps) {
  const isWarning = value >= 80 && value < 90;
  const isCritical = value >= 90;

  const colorClasses = isCritical 
    ? "bg-red-500 shadow-red-200"
    : isWarning 
    ? "bg-amber-500 shadow-amber-200"
    : "bg-emerald-500 shadow-emerald-200";

  const glowShadow = isCritical ? "shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "";

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-end justify-between mb-3">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight">{absoluteValue}</h3>
            <span className="text-sm font-medium text-muted-foreground">Beds Occupied</span>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-2xl font-bold tabular-nums",
            isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-emerald-600"
          )}>
            {value}%
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {isCritical ? "Critical" : isWarning ? "Warning" : "Safe"}
          </p>
        </div>
      </div>

      <div className="relative group">
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "h-full rounded-full transition-colors duration-500 shadow-lg",
              colorClasses,
              glowShadow,
              isCritical && "animate-pulse"
            )}
          />
        </div>
        
        {/* Simple custom tooltip on hover */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <div className="p-2.5 rounded-xl border border-slate-200 shadow-xl bg-white text-slate-900 min-w-[200px]">
             <p className="text-[10px] leading-relaxed font-bold text-slate-500 uppercase tracking-tighter mb-1">Calculation formula</p>
             <p className="text-xs leading-relaxed font-medium">
                Forecast = Current Occupied - Discharges + Admissions
             </p>
          </div>
          <div className="w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45 mx-auto -mt-1" />
        </div>
      </div>

      {/* Markers */}
      <div className="mt-2 flex justify-between px-1">
        <span className="text-[10px] font-bold text-slate-400">0%</span>
        <span className="text-[10px] font-bold text-slate-400">80%</span>
        <span className="text-[10px] font-bold text-slate-400">90%</span>
        <span className="text-[10px] font-bold text-slate-400">100%</span>
      </div>
    </div>
  );
}

