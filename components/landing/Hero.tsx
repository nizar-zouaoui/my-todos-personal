"use client";

import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const container = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.p
          variants={item}
          className="text-sm tracking-hero text-text-secondary"
        >
          Your cozy daily planner
        </motion.p>
        <motion.h1
          variants={item}
          className="text-4xl md:text-5xl font-semibold leading-tight text-text-primary"
        >
          A gentle space for your lists, notes, and
          <span className="text-gradient"> little wins</span>.
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-4 text-lg text-text-secondary max-w-2xl"
        >
          My Todos Personal helps you plan the day with warmth and clarity. Jot
          down tasks, add cozy notes, and focus on what matters to you today.
        </motion.p>
        <motion.div variants={item} className="mt-6 flex flex-wrap gap-3">
          <Button href="/login" variant="primary">
            Start planning
          </Button>
          <Button href="/todos" variant="secondary">
            See my tasks
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="rounded-2xl bg-hero-gradient p-6 shadow-hero border border-border"
      >
        <div className="rounded-xl bg-surface p-4 shadow-card border border-border">
          <div className="text-sm text-text-secondary">Today</div>
          <div className="text-lg font-semibold mt-1 text-text-primary">
            A few gentle priorities
          </div>
          <div className="mt-4 space-y-3">
            {["Pick up groceries", "Call mom", "Stretch for 10 minutes"].map(
              (itemText) => (
                <div
                  key={itemText}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-3 py-2"
                >
                  <span className="text-sm text-text-primary">{itemText}</span>
                  <span className="text-xs text-text-secondary">Do today</span>
                </div>
              ),
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
