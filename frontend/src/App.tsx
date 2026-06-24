import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle, Flame, Loader2 } from 'lucide-react';
import { roastCV, RoastResponse } from './services/api';
import { RoastResult } from './components/RoastResult';
import { RecruiterReaction } from './components/RecruiterReaction';

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roastResult, setRoastResult] = useState<RoastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const handleRoast = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    setRoastResult(null);

    try {
      const result = await roastCV(file);
      setRoastResult(result);
      console.log('Roast Result:', result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while roasting.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col items-center justify-center py-16 px-4 font-sans relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7C3AED] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#7C3AED] rounded-full blur-[150px] opacity-10 pointer-events-none" />

      {roastResult ? (
        <div className="z-10 w-full relative">
          <RoastResult 
            result={roastResult} 
            onReset={() => {
              setRoastResult(null);
              setFile(null);
            }} 
          />
        </div>
      ) : (
        <div className="z-10 w-full max-w-3xl flex flex-col items-center">
          
          {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#7C3AED] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span>AI powered brutal honesty</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
            AI CV <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-pink-500">Roaster</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Because your resume deserves constructive criticism and a little emotional damage.
          </p>
        </div>

        {/* Drag & Drop Upload Section */}
        <div className="w-full max-w-xl mb-8">
          <div 
            className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ease-out p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-900/50 backdrop-blur-sm
              ${dragActive ? 'border-[#7C3AED] bg-[#7C3AED]/10' : 'border-gray-700 hover:border-[#7C3AED]/50 hover:bg-gray-800/50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerUpload}
          >
            <input 
              ref={inputRef}
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleChange}
            />
            
            <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-300 
              ${file ? 'bg-green-500/10' : 'bg-white/5 group-hover:scale-110 group-hover:bg-[#7C3AED]/10'}`}>
              {file ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <UploadCloud className={`w-10 h-10 transition-colors ${dragActive ? 'text-[#7C3AED]' : 'text-gray-400 group-hover:text-[#7C3AED]'}`} />
              )}
            </div>
            
            {file ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold text-white truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-sm text-red-400 hover:text-red-300 mt-2 hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold mb-2 text-gray-200">
                  Drag & Drop your resume
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  or <span className="text-[#7C3AED] font-medium group-hover:underline">browse files</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-2">
                  <span className="flex items-center gap-1.5"><FileType className="w-3.5 h-3.5"/> PDF</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <span className="flex items-center gap-1.5"><FileType className="w-3.5 h-3.5"/> DOCX</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <span className="flex items-center gap-1.5"><FileType className="w-3.5 h-3.5"/> TXT</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={!file || isLoading}
          onClick={handleRoast}
          className={`relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 overflow-hidden
            ${file 
              ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:-translate-y-1' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
        >
          {file && !isLoading && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]" />
          )}
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Flame className={`w-5 h-5 ${file ? 'text-orange-400' : 'text-gray-500'}`} />
          )}
          {isLoading ? 'Roasting...' : 'Roast My CV'}
        </button>

        {isLoading && <RecruiterReaction />}

        {error && !isLoading && (
          <p className="mt-4 text-red-400 font-medium text-sm">{error}</p>
        )}

        </div>
      )}
    </div>
  );
}

export default App;
