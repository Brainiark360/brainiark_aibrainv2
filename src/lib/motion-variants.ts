// /src/lib/motion-variants.ts
import type { Variants } from "framer-motion";

/** Fade upward */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

/** Simple fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

/** Scale up */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

/** Slide from right */
export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

/** Stagger animation for children */
export const staggerChildren: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/** Pulsing animation */
export const pulseAnimation: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

/** Rotating orbit */
export const orbitAnimation = (radius: number, duration: number) =>
  ({
    animate: {
      rotate: 360,
      transition: { duration, repeat: Infinity, ease: "linear" }
    }
  }) as Variants;

/** Slide in + exit */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

/** "Chip" element entering with spring */
export const chipEnter: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

/** Neural subtle pulse */
export const neuralPulse: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

/** Fade upward */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
  }
};

/** Container that staggers children */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};
