'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'mood' | 'ghost';

type Props = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  children: React.ReactNode;
};

/** Pill button with spring press. The only button style in the app. */
export function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96, y: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn('btn', `btn-${variant}`, className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
