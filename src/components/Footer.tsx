import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      className="w-full py-8 px-6 mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Made with
            </span>
            <Heart size={14} className="text-red-400" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5"
              onClick={() => window.open('https://buymeacoffee.com/prxthxm22', '_blank')}
            >
              <Coffee size={14} />
              <span>Support</span>
            </Button>
          </div>
          
          <div className="mb-2 mt-1">
            <img 
              src="/lovable-uploads/white_logo.svg" 
              alt="BoltPass Logo" 
              className="h-5 opacity-60" 
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BoltPass. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
