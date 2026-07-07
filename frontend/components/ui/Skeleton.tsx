"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className = '', width = '100%', height = '1.2rem', borderRadius = 'var(--border-radius)' }: SkeletonProps) {
  return (
    <motion.div
      className={`skeleton-loader ${className}`}
      style={{ width, height, borderRadius, background: 'rgba(255, 255, 255, 0.05)' }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
