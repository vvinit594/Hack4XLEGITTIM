import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HeartLoader from "./ui/HeartLoader";

interface PageLoaderWrapperProps {
  children: React.ReactNode;
}

const PageLoaderWrapper: React.FC<PageLoaderWrapperProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    setProgress(0);

    // Realistic progress simulation
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Speed up or slow down based on progress
      // 0-30: fast (initial jump)
      // 30-80: medium (data fetching)
      // 80-99: slow (waiting for final render)
      let increment = 0;
      if (currentProgress < 30) {
        increment = Math.random() * 10 + 5;
      } else if (currentProgress < 80) {
        increment = Math.random() * 5 + 2;
      } else if (currentProgress < 99) {
        increment = 0.5;
      }

      currentProgress = Math.min(currentProgress + increment, 99.5);
      setProgress(currentProgress);
    }, 75);

    // Finalize after ~0.9s (2× faster than prior 1.8s)
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        clearInterval(interval);
      }, 200);
    }, 900);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[100]"
          >
            <HeartLoader progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default PageLoaderWrapper;
