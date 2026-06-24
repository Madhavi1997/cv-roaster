import React, { useEffect, useRef } from 'react';
import { RoastResponse } from '../services/api';
import { Flame, RefreshCcw, AlertTriangle, TrendingUp, ChevronRight, Share2, Download, Award } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { toPng } from 'html-to-image';

interface Props {
  result: RoastResponse;
  onReset: () => void;
}

const AnimatedCounter = ({ value, className }: { value: number, className?: string }) => {
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
};

export const RoastResult: React.FC<Props> = ({ result, onReset }) => {
  const roastRef = useRef<HTMLDivElement>(null);

  const handleShareImage = async () => {
    if (!roastRef.current) return;
    try {
      const dataUrl = await toPng(roastRef.current, { cacheBust: true, backgroundColor: '#111827', style: { padding: '24px' } });
      const link = document.createElement('a');
      link.download = 'my-cv-roast.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const handleDownloadPDF = () => {
    if (result.id) {
      window.open(`http://localhost:5000/api/download-report?id=${result.id}`, '_blank');
    }
  };

  // Helper to color code the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-400/10 border-green-400/30';
    if (score >= 50) return 'bg-yellow-400/10 border-yellow-400/30';
    return 'bg-red-500/10 border-red-500/30';
  };
  
  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getRoastFire = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('mild')) return '🔥 Mild Roast';
    if (l.includes('medium')) return '🔥🔥 Medium Roast';
    if (l.includes('severe')) return '🔥🔥🔥 Severe Roast';
    if (l.includes('trauma')) return '🔥🔥🔥🔥 Recruiter Trauma';
    // Fallback based on score if level string doesn't match
    if (result.overallScore >= 80) return '🔥 Mild Roast';
    if (result.overallScore >= 50) return '🔥🔥 Medium Roast';
    if (result.overallScore >= 30) return '🔥🔥🔥 Severe Roast';
    return '🔥🔥🔥🔥 Recruiter Trauma';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
      <motion.div 
        ref={roastRef}
        className="w-full space-y-8 rounded-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Top Section: Score and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Score Card */}
        <motion.div variants={itemVariants} className="col-span-1 bg-gray-900/50 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[#7C3AED]/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-gray-400 font-medium uppercase tracking-wider text-sm mb-4">Overall Score</h2>
          <div className={`text-7xl font-black mb-2 flex items-baseline justify-center ${getScoreColor(result.overallScore)}`}>
            <AnimatedCounter value={result.overallScore} />
          </div>
          <div className="text-sm text-gray-500">out of 100</div>
          
          <div className="w-full h-2 bg-gray-800 rounded-full mt-6 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${getScoreBarColor(result.overallScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${result.overallScore}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-gray-900/50 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="w-6 h-6 text-orange-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">
              Roast Level: <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{getRoastFire(result.roastLevel)}</span>
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg italic border-l-4 border-[#7C3AED] pl-4 mb-auto">
            "{result.summary}"
          </p>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {result.categories.map((category, index) => (
          <motion.div 
            variants={itemVariants}
            key={index}
            className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-white/10 transition-colors"
          >
            {/* Category Header */}
            <div className={`px-6 py-4 border-b flex flex-col gap-3 ${getScoreBg(category.score)}`}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">{category.name}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gray-950/50 flex gap-1 ${getScoreColor(category.score)}`}>
                  <AnimatedCounter value={category.score} /> / 100
                </div>
              </div>
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${getScoreBarColor(category.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${category.score}%` }}
                  transition={{ duration: 1.5, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Category Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Brutal Truth
                </div>
                <p className="text-gray-200 leading-relaxed">{category.roast}</p>
              </div>

              {category.suggestions.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-[#7C3AED]" /> How to Fix It
                  </div>
                  <ul className="space-y-2">
                    {category.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <ChevronRight className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final Verdict */}
      {result.finalVerdict && (
        <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-[#7C3AED]/20 to-pink-500/20 backdrop-blur-md rounded-2xl border border-[#7C3AED]/30 p-8 text-center shadow-lg mt-8">
          <div className="flex justify-center mb-3">
            <Award className="w-10 h-10 text-pink-400" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-pink-300 mb-2">Final Verdict</h2>
          <p className="text-2xl font-black text-white">{result.finalVerdict}</p>
        </motion.div>
      )}

      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-wrap justify-center gap-4 w-full"
      >
        <button 
          onClick={handleShareImage}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-pink-500 hover:from-[#6D28D9] hover:to-pink-600 text-white font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <Share2 className="w-5 h-5" /> Share as Image
        </button>
        {result.id && (
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold transition-all hover:scale-105 shadow-lg"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
        )}
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold transition-all hover:scale-105"
        >
          <RefreshCcw className="w-5 h-5" /> Try Another CV
        </button>
      </motion.div>
    </div>
  );
};
