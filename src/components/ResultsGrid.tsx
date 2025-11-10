import React from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon } from './Icons';

interface ResultsGridProps {
  images: GeneratedImage[];
  originalImageSrc?: string;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ images, originalImageSrc }) => {
  const allImages = originalImageSrc ? [{ src: originalImageSrc, title: 'Original' }, ...images] : images;
  
  const handleDownload = (src: string, title: string) => {
    const link = document.createElement('a');
    link.href = src;
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(allImages.length, 4)} gap-4 sm:gap-6`}>
      {allImages.map((image, index) => (
        <div key={index} className="bg-[#1C1C1C] rounded-lg shadow-lg shadow-black/30 overflow-hidden group transform transition-transform hover:-translate-y-1.5">
          <div className="aspect-square relative">
            <img src={image.src} alt={image.title} className="w-full h-full object-cover" />
             {image.title !== 'Original' && (
              <button
                onClick={() => handleDownload(image.src, image.title)}
                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Baixar imagem"
              >
                <DownloadIcon />
              </button>
            )}
          </div>
          <div className="p-3 text-center bg-brand-dark">
            <h3 className="font-semibold text-brand-gold text-sm sm:text-base truncate tracking-wider">{image.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};