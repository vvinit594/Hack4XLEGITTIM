import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ForecastBadgeProps = {
  percentage: number;
};

export function ForecastBadge({ percentage }: ForecastBadgeProps) {
  if (percentage < 90) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      className="flex items-center justify-center mb-6"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 0 0 0px rgba(239, 68, 68, 0)",
            "0 0 0 4px rgba(239, 68, 68, 0.2)",
            "0 0 0 0px rgba(239, 68, 68, 0)"
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-red-50 border border-red-200 text-red-700",
          "shadow-sm shadow-red-100"
        )}
      >
        <AlertCircle className="size-4 animate-pulse" />
        <span className="text-sm font-bold tracking-tight">
          ⚠️ Capacity Crunch in 4 Hours
        </span>
      </motion.div>
    </motion.div>
  );
}
