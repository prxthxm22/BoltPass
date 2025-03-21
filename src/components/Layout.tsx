import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// This component replaces any Next.js functionality with React Router equivalents
export const Link = ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: any }) => {
  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col dark">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout; 