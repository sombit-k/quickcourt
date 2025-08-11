"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

export const Meteors = ({
  number,
  className
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    (<motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {meteors.map((el, idx) => {
        const meteorCount = number || 20;
        // Calculate position to spread meteors across full width using percentage
        const position = (idx / meteorCount) * 100; // Spread across 0-100% of container width
        
        // Use deterministic values based on index instead of Math.random()
        const delay = (idx * 0.5) % 5; // Deterministic delay between 0-5s
        const duration = 5 + (idx % 5); // Deterministic duration between 5-9s

        return (
          (<span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
              "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
              className
            )}
            style={{
              top: "-40px",
              left: position + "%",
              animationDelay: delay + "s",
              animationDuration: duration + "s",
            }}></span>)
        );
      })}
    </motion.div>)
  );
};
