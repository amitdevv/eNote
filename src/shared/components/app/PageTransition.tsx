import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PageTransition({ children, keyId }: { children: ReactNode; keyId: string }) {
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col min-h-0"
    >
      {children}
    </motion.div>
  );
}
