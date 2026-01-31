import { motion, useReducedMotion } from "framer-motion";

type MotionFadeInProps = {
  children: React.ReactNode;
  className?: string;
};

export default function MotionFadeIn({
  children,
  className,
}: MotionFadeInProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
