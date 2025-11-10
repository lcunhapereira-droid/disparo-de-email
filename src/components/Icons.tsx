
import React from 'react';

export const SparklesIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v2.586l1.293-1.293a1 1 0 111.414 1.414L12.414 8H15a1 1 0 110 2h-2.586l1.293 1.293a1 1 0 11-1.414 1.414L11 11.414V14a1 1 0 11-2 0v-2.586l-1.293 1.293a1 1 0 11-1.414-1.414L7.586 10H5a1 1 0 110 2h2.586L6.293 6.707a1 1 0 011.414-1.414L9 6.414V4a1 1 0 011-1zM5 3a1 1 0 011 1v1.586l-1.293-1.293a1 1 0 111.414-1.414L6.414 3H5zM14 3a1 1 0 011 1v1.586l1.293-1.293a1 1 0 011.414 1.414L17.414 5H19a1 1 0 110 2h-1.586l1.293 1.293a1 1 0 11-1.414 1.414L16 8.414V10a1 1 0 11-2 0V8.414l-1.293-1.293a1 1 0 011.414-1.414L15 6.414V4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

export const CameraIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    <path d="M10 12a3 3 0 100-6 3 3 0 000 6z" />
    <path d="M14 8a1 1 0 10-2 0v.01a1 1 0 102 0V8z" />
  </svg>
);

export const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);