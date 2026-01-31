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
          className="text-sm uppercase tracking-hero text-text-secondary"
        >
          Focused workflow
        </motion.p>
        <motion.h2
          variants={item}
          className="text-4xl md:text-5xl font-semibold leading-tight text-text-primary"
        >
          A calm place to plan your week and
          <span className="text-gradient"> finish with confidence</span>.
        </motion.h2>
        <motion.p
          variants={item}
          className="mt-4 text-lg text-text-secondary max-w-2xl"
        >
          Taskflow keeps priorities visible, deadlines gentle, and your team in
          sync. Capture tasks, add rich notes, and focus on what matters today.
        </motion.p>
        <motion.div variants={item} className="mt-6 flex flex-wrap gap-3">
          <Button href="/login" variant="primary">
            Get started
          </Button>
          <Button href="/todos" variant="secondary">
            View tasks
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="rounded-xl bg-hero-gradient p-6 shadow-hero border border-border"
      >
        <div className="rounded-lg bg-surface p-4 shadow-card border border-border">
          <div className="text-sm text-text-secondary">Today</div>
          <div className="text-lg font-semibold mt-1 text-text-primary">
            Your next three wins
          </div>
          <div className="mt-4 space-y-3">
            {[
              "Plan sprint tasks",
              "Review launch checklist",
              "Ship update",
            ].map((itemText) => (
              <div
                key={itemText}
                className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2"
              >
                <span className="text-sm text-text-primary">{itemText}</span>
                <span className="text-xs text-text-secondary">Due soon</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
