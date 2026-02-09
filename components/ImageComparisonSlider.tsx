import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string | null;
  beforeLabel?: string;
  afterLabel?: string;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "改造前",
  afterLabel = "改造后"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let position = ((clientX - rect.left) / rect.width) * 100;
    position = Math.max(0, Math.min(100, position));
    setSliderPosition(position);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Use the before image if after image is not ready yet to prevent blank space
  const displayAfter = afterImage || beforeImage;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none group cursor-col-resize touch-none"
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Background Image (After Result) - Fully visible underneath */}
      <img 
        src={displayAfter} 
        alt="After" 
        className="absolute top-0 left-0 w-full h-full object-cover" 
      />
      
      {/* Label for After Image (Right side) */}
      <div className="absolute top-4 right-4 bg-indigo-600/90 text-white px-3 py-1 rounded-full text-xs font-bold z-10 backdrop-blur-sm shadow-lg border border-indigo-400/50 pointer-events-none transition-opacity duration-300">
        {afterLabel}
      </div>

      {/* Foreground Image (Original) - Clipped */}
      <img 
        src={beforeImage} 
        alt="Before" 
        className="absolute top-0 left-0 w-full h-full object-cover will-change-[clip-path]"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
        }}
      />

      {/* Label for Before Image (Left side) - Fades out when slider moves right */}
      <div 
        className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold z-10 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: sliderPosition < 10 ? 0 : 1 }}
      >
        {beforeLabel}
      </div>

      {/* Slider Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center text-indigo-600 border border-indigo-100 transform transition-transform group-hover:scale-110">
           <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>
      
      {/* Hint Overlay (Shows only on initial hover if not dragged yet) */}
      {!isDragging && sliderPosition === 50 && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-500">
            <div className="bg-black/40 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-medium animate-pulse">
               左右拖动对比
            </div>
         </div>
      )}
    </div>
  );
};

export default ImageComparisonSlider;
