import type { ImagePayload } from '../types';

export const convertFileToImagePayload = (file: File): Promise<ImagePayload> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        data: reader.result as string,
        mimeType: file.type,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};