import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  currentImage?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, currentImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const baseClasses = "relative aspect-square w-full max-w-sm mx-auto rounded-lg cursor-pointer transition-all duration-300";
  const borderClasses = `border-2 border-dashed ${isDragging ? 'border-brand-gold scale-105' : 'border-brand-light/40'}`;
  
  return (
    <div className="w-full flex justify-center">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`${baseClasses} ${borderClasses} ${currentImage ? 'border-solid !border-brand-gold/50' : ''}`}
      >
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        {currentImage ? (
          <img src={currentImage} alt="Pré-visualização da imagem" className="object-cover w-full h-full rounded-md" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-brand-light/60">
            <UploadIcon />
            <p className="mt-2 font-semibold">Clique para enviar ou arraste e solte</p>
            <p className="text-xs text-brand-light/70 mt-1">Recomendado: PNG, JPG, WEBP</p>
          </div>
        )}
      </label>
    </div>
  );
};