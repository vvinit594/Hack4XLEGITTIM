import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, LayoutDashboard, Calendar, History, Info } from "lucide-react";

import { ForecastBadge } from "@/components/forecast/ForecastBadge";
import { CapacityWidget } from "@/components/forecast/CapacityWidget";
import { MetricCardsContainer } from "@/components/forecast/MetricCards";
import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard";
import { Button } from "@/components/ui/button";

// Mock projection data with initial state
const INITIAL_DATA = {
  forecast_4h: 37,
  forecast_8h: 41,
  pct_4h: 84, // Starts in warning
  pct_8h: 93, // Starts in critical
  risk_level: "critical" as const,
};

const METRICS_INITIAL = {
  currentOccupied: 35,
  expectedDischarges: 4,
  expectedAdmissions: 6,
};

export function CapacityForecastPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [metrics] = useState(METRICS_INITIAL);
  const [updateCount, setUpdateCount] = useState(0);

  // Simulate real-time updates every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Randomly fluctuate percentages slightly
        const delta4h = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const delta8h = Math.floor(Math.random() * 3) - 1;

        const nextPct4h = Math.min(100, Math.max(70, prev.pct_4h + delta4h));
        const nextPct8h = Math.min(100, Math.max(75, prev.pct_8h + delta8h));

        return {
          ...prev,
          pct_4h: nextPct4h,
          pct_8h: nextPct8h,
          forecast_4h: Math.round((prev.forecast_4h * (nextPct4h / prev.pct_4h))),
          forecast_8h: Math.round((prev.forecast_8h * (nextPct8h / prev.pct_8h))),
        };
      });
      setUpdateCount(c => c + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-svh bg-[#FAFBFC] relative overflow-hidden flex flex-col">
      {/* Background Ornaments */}
      <div className="absolute top-0 inset-x-0 h-[400px] pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] left-[60%] w-[600px] h-[600px] rounded-full opacity-[0.03] bg-indigo-600 blur-[100px]" />
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.02] bg-blue-600 blur-[80px]" />
      </div>

      <header className="relative z-10 p-6 sm:p-10 pb-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex items-center justify-center size-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                <Activity className="size-5" />
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Capacity Forecast</h1>
            </div>
            <p className="text-lg font-medium text-muted-foreground max-w-lg leading-relaxed">
              Predict ward occupancy and avoid capacity overload. Powered by real-time predictive analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl bg-white border-slate-200/80 shadow-sm hover:shadow-md transition-all gap-2">
              <History className="size-4 opacity-70" />
              History
            </Button>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all gap-2">
              <LayoutDashboard className="size-4" />
              Recalculate
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6 sm:p-10 pt-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <ForecastBadge percentage={data.pct_4h} />
          </AnimatePresence>

          <CapacityWidget data={data} key={updateCount} />

          <MetricCardsContainer 
            currentOccupied={metrics.currentOccupied} 
            expectedDischarges={metrics.expectedDischarges} 
            expectedAdmissions={metrics.expectedAdmissions} 
          />

          {/* Additional Insight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <AnimatedBorderCard
              innerClassName="bg-slate-50/95 p-0"
            >
              <div className="flex items-start gap-4 p-6">
                <div className="mt-0.5 rounded-lg border border-blue-200 bg-blue-100/80 p-2">
                  <Info className="size-4 text-blue-700" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold text-slate-900">
                    Forecast Insight
                  </h4>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    The{" "}
                    <span className="font-semibold text-slate-900 italic">
                      Capacity Crunch
                    </span>{" "}
                    expected at the 8-hour mark is primarily driven by an
                    influx of 12 scheduled elective surgeries peaking around 6:00
                    PM. Consider early discharge for stable patients.
                  </p>
                </div>
              </div>
            </AnimatedBorderCard>
          </motion.div>

          {/* Legend / Timeline section (Placeholder) */}
          <div className="mt-12 flex items-center justify-between text-muted-foreground">
             <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Update 5m ago</span>
             </div>
             <p className="text-xs font-medium italic opacity-70 flex items-center gap-1.5">
                <Calendar className="size-3" /> Projection valid until {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-10 mt-auto border-t border-slate-200/40 opacity-70 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-muted-foreground">© 2026 Hospi-Track AI Predictive Systems</p>
          <div className="flex gap-6">
            <span className="text-xs font-bold text-slate-400 cursor-help underline underline-offset-4 decoration-slate-200">Privacy Policy</span>
            <span className="text-xs font-bold text-slate-400 cursor-help underline underline-offset-4 decoration-slate-200">System Status</span>
          </div>
      </footer>
    </div>
  );
}
