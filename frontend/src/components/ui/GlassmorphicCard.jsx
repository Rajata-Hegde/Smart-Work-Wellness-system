import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/glassmorphism.css';

/**
 * GlassmorphicCard - Beautiful card with glassmorphism effect
 */
const GlassmorphicCard = ({
  children,
  className = '',
  variant = 'dark', // 'dark' or 'light'
  glow = false,
  interactive = false,
  onClick,
  ...props
}) => {
  const glassClass = variant === 'dark' ? 'glassmorphic-dark' : 'glassmorphic-card';
  const glowClass = glow ? 'neon-glow' : '';
  const hoverClass = interactive ? 'hover-lift cursor-pointer' : '';

  return (
    <motion.div
      className={`
        ${glassClass} 
        ${glowClass} 
        ${hoverClass}
        rounded-xl p-6 backdrop-blur-xl
        border border-opacity-20
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
      whileHover={interactive ? { y: -4 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassmorphicCard;
