import React from 'react';

const loadingMessages = [
  "Consultando nossos especialistas em estilo...",
  "Aperfeiçoando os pixels...",
  "Criando seu novo visual...",
  "Aplicando magia digital...",
  "Só um momento, a beleza está em andamento..."
];

export const LoadingSpinner: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-brand-gold border-brand-light/20 rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-light text-lg font-serif">{message}</p>
    </div>
  );
};