import React from 'react';
import { Mic, Volume2, Sparkles, Loader2 } from 'lucide-react';

export type VisualizerState = 'idle' | 'speaking' | 'listening' | 'evaluating';

interface AudioVisualizerProps {
  state: VisualizerState;
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
  onClick?: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  state,
  size = 'md',
  caption,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48',
  };

  const getAuraColor = () => {
    switch (state) {
      case 'listening':
        return 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30 border-emerald-500/50 shadow-emerald-500/30';
      case 'speaking':
        return 'from-indigo-500/40 via-violet-500/30 to-purple-500/40 border-indigo-400/60 shadow-indigo-500/40';
      case 'evaluating':
        return 'from-amber-500/30 via-orange-500/20 to-rose-500/30 border-amber-400/50 shadow-amber-500/30 animate-spin';
      default:
        return 'from-slate-700/20 via-indigo-900/10 to-slate-800/20 border-slate-700/40 shadow-indigo-900/20';
    }
  };

  const getCoreColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-emerald-500/50';
      case 'speaking':
        return 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white shadow-indigo-500/50';
      case 'evaluating':
        return 'bg-gradient-to-tr from-amber-600 via-orange-600 to-pink-600 text-white shadow-amber-500/50';
      default:
        return 'bg-gradient-to-tr from-slate-800 via-slate-700 to-indigo-900 text-slate-300 shadow-slate-900/40';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="w-10 h-10 animate-bounce" />;
      case 'speaking':
        return <Volume2 className="w-10 h-10 animate-pulse" />;
      case 'evaluating':
        return <Loader2 className="w-10 h-10 animate-spin" />;
      default:
        return <Sparkles className="w-10 h-10 opacity-70" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          onClick ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        {/* Outer ambient wave rings */}
        {(state === 'speaking' || state === 'listening') && (
          <>
            <div
              className={`absolute -inset-4 rounded-full bg-gradient-to-r ${getAuraColor()} opacity-40 blur-xl animate-ping`}
              style={{ animationDuration: '2.5s' }}
            />
            <div
              className={`absolute -inset-8 rounded-full bg-gradient-to-r ${getAuraColor()} opacity-25 blur-2xl animate-pulse`}
              style={{ animationDuration: '1.8s' }}
            />
          </>
        )}

        {/* Middle decorative border circle */}
        <div
          className={`${sizeClasses[size]} rounded-full p-2 bg-gradient-to-br ${getAuraColor()} border flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-500`}
        >
          {/* Inner core circle */}
          <div
            className={`w-full h-full rounded-full ${getCoreColor()} flex items-center justify-center shadow-lg transition-all duration-500`}
          >
            {getIcon()}
          </div>
        </div>
      </div>

      {/* Dynamic Soundwave Bars */}
      <div className="flex items-center gap-1.5 mt-5 h-8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => {
          const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.2, 0.4];
          const isActive = state === 'speaking' || state === 'listening';
          return (
            <div
              key={bar}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? state === 'listening'
                    ? 'bg-emerald-400 soundwave-bar'
                    : 'bg-indigo-400 soundwave-bar'
                  : 'h-1.5 bg-slate-700'
              }`}
              style={{
                animationDelay: `${delays[bar]}s`,
                height: isActive ? undefined : '6px',
              }}
            />
          );
        })}
      </div>

      {caption && (
        <p className="mt-3 text-xs sm:text-sm font-medium text-slate-300 tracking-wide text-center">
          {caption}
        </p>
      )}
    </div>
  );
};
