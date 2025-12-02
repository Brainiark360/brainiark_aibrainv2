"use client";

import React from "react";
import { motion } from "framer-motion";

const ProductStory: React.FC = () => {
  return (
    <section id="story" className="flex flex-col items-center text-center">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="text-2xl sm:text-3xl font-semibold tracking-tight"
      >
        A New Category in Marketing
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="
          mt-6 max-w-xl text-base leading-relaxed
          text-[rgb(var(--br-fg-muted))]
        "
      >
        Brainiark is not another dashboard, scheduler, or content planner.  
        It’s a strategy-first, conversational operating system — a new layer
        between your brand and the world.  
        A thinking environment where decisions come before execution.
      </motion.p>
    </section>
  );
};

export default ProductStory;
