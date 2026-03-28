import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  gradient: string;
};

export function StatCard({ title, value, icon, trend, trendPositive, gradient }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50"
    >
      <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-20", gradient)} />
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trendPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={cn("p-3 rounded-xl text-white shadow-lg", gradient)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function StatBar({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}
