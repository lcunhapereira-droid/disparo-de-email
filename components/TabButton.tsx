import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "relative flex items-center gap-2 text-sm sm:text-base font-semibold py-2 px-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold rounded-md";
  const activeClasses = "text-brand-light";
  const inactiveClasses = "text-brand-light/60 hover:text-brand-light";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
      <span
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold transition-transform duration-300 ease-in-out ${
          isActive ? 'scale-x-100' : 'scale-x-0'
        }`}
        aria-hidden="true"
      />
    </button>
  );
};