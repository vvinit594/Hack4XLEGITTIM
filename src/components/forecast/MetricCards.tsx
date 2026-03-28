import { motion } from "framer-motion";
import { BedDouble, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
};

function MetricCard({ title, value, icon, iconBg }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 flex items-center justify-between rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 hover:shadow-md transition-shadow duration-300"
    >
      <div className="space-y-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={cn("p-2.5 rounded-xl shadow-sm", iconBg)}>
        {icon}
      </div>
    </motion.div>
  );
}

type MetricCardsContainerProps = {
  currentOccupied: number;
  expectedDischarges: number;
  expectedAdmissions: number;
};

export function MetricCardsContainer({ currentOccupied, expectedDischarges, expectedAdmissions }: MetricCardsContainerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <MetricCard 
        title="Current Occupied" 
        value={currentOccupied} 
        icon={<BedDouble className="size-5 text-blue-600" />} 
        iconBg="bg-blue-50/80 border border-blue-100"
      />
      <MetricCard 
        title="Exp. Discharges (4h)" 
        value={expectedDischarges} 
        icon={<UserMinus className="size-5 text-emerald-600" />} 
        iconBg="bg-emerald-50/80 border border-emerald-100"
      />
      <MetricCard 
        title="Exp. Admissions (4h)" 
        value={expectedAdmissions} 
        icon={<UserPlus className="size-5 text-amber-600" />} 
        iconBg="bg-amber-50/80 border border-amber-100"
      />
    </div>
  );
}
