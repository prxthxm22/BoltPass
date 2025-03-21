import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { GitHub, Settings, Home, Shield, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'BoltPass - Secure Password Management'
}) => {
  const router = useRouter();
  const currentPath = router.pathname;
  
  const navigationItems = [
    { href: '/', label: 'Home', icon: <Home size={16} /> },
    { href: '/diagnostics', label: 'Diagnostics', icon: <BarChart3 size={16} /> },
  ];
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Secure password management and generation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-blue-950 to-zinc-900">
        <header className="sticky top-0 z-10 backdrop-blur-lg bg-zinc-900/70 border-b border-white/10">
          <div className="container max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/white_logo.svg" alt="BoltPass" className="h-8" />
              <span className="font-bold text-xl hidden sm:inline">
                BoltPass <span className="text-sm font-normal text-blue-400">v2.0</span>
              </span>
            </Link>
            
            <nav className="flex items-center gap-1 md:gap-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                    currentPath === item.href 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
              
              <a
                href="https://github.com/your-username/boltpass"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                aria-label="GitHub Repository"
              >
                <GitHub size={18} />
              </a>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
        
        <footer className="mt-auto py-6 bg-zinc-950/50 border-t border-white/5">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <img src="/white_logo.svg" alt="BoltPass" className="h-6" />
                <span className="text-white/70 text-sm">
                  BoltPass v2.0 - Secure Password Management
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-white/50 text-sm">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/diagnostics" className="hover:text-white transition-colors">
                  Diagnostics
                </Link>
                <a 
                  href="https://github.com/your-username/boltpass" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <GitHub size={14} />
                  GitHub
                </a>
              </div>
              
              <div className="text-white/50 text-sm flex items-center gap-1">
                <Shield size={14} />
                <span>Data stored locally in your browser</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}; 