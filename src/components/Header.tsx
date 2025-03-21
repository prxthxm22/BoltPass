import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="w-full py-6 px-6 flex justify-center items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container max-w-5xl mx-auto flex items-center justify-center">
        <motion.div 
          className="flex items-center justify-center gap-3"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img 
            src="/lovable-uploads/white_logo.svg" 
            alt="BoltPass Logo" 
            className="h-12 md:h-16" 
          />
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
