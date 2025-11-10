import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-8 text-center">
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-light tracking-wider">
        Studio Luminous
      </h1>
      <p className="text-sm text-brand-light/70 mt-2 font-sans tracking-widest uppercase">
        Sua melhor versão!
      </p>
    </header>
  );
};