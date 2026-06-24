import React, { useState, useRef } from 'react';

interface UploadBoxProps {
  onFileSelect?: (file: File) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'text/plain'
];

export const UploadBox: React.FC<UploadBoxProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExtension = ['pdf', 'docx', 'txt'].includes(fileExtension || '');
    
    if (!ALLOWED_TYPES.includes(file.type) && !isAllowedExtension) {
      setError('Invalid file type. Only PDF, DOCX, and TXT are allowed.');
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }
    
    return true;
  };

  const handleFile = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    } else {
      setFile(null);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      // Depending on requirements, we might want to signal removal
      // by passing null if onFileSelect allowed it. We'll leave it as is.
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-800/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onChange}
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${
            isDragging 
              ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/50 dark:text-blue-400' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
          }`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            PDF, DOCX, TXT (Max {MAX_FILE_SIZE_MB}MB)
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {file && !error && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-700 truncate dark:text-gray-200">
                {file.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button 
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
