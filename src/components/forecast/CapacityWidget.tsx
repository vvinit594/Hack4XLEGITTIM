import { motion } from "framer-motion";
import { GaugeBar } from "./GaugeBar";
import { cn } from "@/lib/utils";

type CapacityForecastData = {
  forecast_4h: number;
  forecast_8h: number;
  pct_4h: number;
  pct_8h: number;
  risk_level: "safe" | "warning" | "critical";
};

type CapacityWidgetProps = {
  data: CapacityForecastData;
};

export function CapacityWidget({ data }: CapacityWidgetProps) {
  const isCritical = data.pct_4h >= 90 || data.pct_8h >= 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isCritical 
          ? "0 20px 50px -12px rgba(239, 68, 68, 0.25)"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "p-6 sm:p-10 rounded-3xl border bg-white relative overflow-hidden transition-all duration-500",
        isCritical ? "border-red-200/60 ring-1 ring-red-100/50" : "border-slate-200/80 shadow-sm shadow-slate-200/40"
      )}
    >
      {/* Background Subtle Gradient */}
      <div 
        className={cn(
          "absolute top-0 right-0 w-1/3 h-1/3 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 transition-colors duration-1000",
          isCritical ? "bg-red-50/70" : "bg-blue-50/50"
        )} 
      />

      <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
        <GaugeBar 
          value={data.pct_4h} 
          absoluteValue={data.forecast_4h} 
          label="4h Forecast" 
        />
        
        <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 to-transparent my-4 opacity-70" />
        
        <GaugeBar 
          value={data.pct_8h} 
          absoluteValue={data.forecast_8h} 
          label="8h Forecast" 
        />
      </div>
    </motion.div>
  );
}
