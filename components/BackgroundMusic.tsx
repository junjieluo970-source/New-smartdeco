import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface BackgroundMusicProps {
  shouldPlay: boolean;
}

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ shouldPlay }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  // Volume state for fade in/out effect could be added, but simple play/pause is sufficient for now.

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (shouldPlay && !isMuted) {
      // Attempt to play. Browsers might block if no interaction, 
      // but since user clicked "Generate", it usually works.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback waiting for interaction:", error);
        });
      }
    } else {
      audio.pause();
    }
  }, [shouldPlay, isMuted]);

  if (!shouldPlay) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-indigo-100 flex items-center gap-3 pr-5 transition-all hover:bg-white hover:shadow-xl hover:scale-105">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">Ambient Mode</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
             {isMuted ? '已静音' : '正在播放'} 
             {!isMuted && <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 h-full bg-indigo-400 animate-music-bar-1"></span>
                <span className="w-0.5 h-full bg-indigo-400 animate-music-bar-2"></span>
                <span className="w-0.5 h-full bg-indigo-400 animate-music-bar-3"></span>
             </span>}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/audio/2022/02/10/audio_fc8c8392ce.mp3" 
        crossOrigin="anonymous"
      />
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        .animate-music-bar-1 { animation: music-bar 0.8s infinite ease-in-out; }
        .animate-music-bar-2 { animation: music-bar 0.8s infinite ease-in-out 0.2s; }
        .animate-music-bar-3 { animation: music-bar 0.8s infinite ease-in-out 0.4s; }
      `}</style>
    </div>
  );
};

export default BackgroundMusic;