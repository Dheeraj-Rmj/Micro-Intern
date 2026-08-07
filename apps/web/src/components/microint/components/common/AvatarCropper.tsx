import React, { useRef, useState, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setScale(1);
        setPosition({ x: 0, y: 0 });
        draw();
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  useEffect(() => {
    if (isOpen) {
      draw();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, scale, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = imageRef.current;
    const size = Math.min(canvas.width, canvas.height);
    
    // Calculate aspect ratio fit
    const imgAspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;
    
    if (imgAspect > 1) {
      drawWidth = size * imgAspect;
    } else {
      drawHeight = size / imgAspect;
    }

    drawWidth *= scale;
    drawHeight *= scale;

    const dx = (canvas.width - drawWidth) / 2 + position.x;
    const dy = (canvas.height - drawHeight) / 2 + position.y;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    
    // Draw circle overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(canvas.width/2, canvas.height/2, size/2, 0, Math.PI * 2, true);
    ctx.fill();
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : (e as React.MouseEvent).clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas to get just the cropped circle
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw without the overlay
    const img = imageRef.current;
    if (!img) return;
    
    const size = Math.min(canvas.width, canvas.height);
    const imgAspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;
    if (imgAspect > 1) { drawWidth = size * imgAspect; } else { drawHeight = size / imgAspect; }
    drawWidth *= scale; drawHeight *= scale;
    const dx = (canvas.width - drawWidth) / 2 + position.x;
    const dy = (canvas.height - drawHeight) / 2 + position.y;

    tempCtx.beginPath();
    tempCtx.arc(tempCanvas.width/2, tempCanvas.height/2, size/2, 0, Math.PI * 2);
    tempCtx.clip();
    tempCtx.drawImage(img, dx, dy, drawWidth, drawHeight);

    onCropComplete(tempCanvas.toDataURL('image/jpeg', 0.9));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 max-w-md w-full shadow-2xl flex flex-col gap-6 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Adjust Avatar</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-center bg-black/50 rounded-2xl overflow-hidden touch-none"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             onTouchStart={handleMouseDown}
             onTouchMove={handleMouseMove}
             onTouchEnd={handleMouseUp}
        >
          <canvas ref={canvasRef} width={300} height={300} className="cursor-move" />
        </div>

        <div className="flex items-center gap-4 text-white/60">
          <ZoomOut className="w-5 h-5 shrink-0" />
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.05" 
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-[#E1E0CC]"
          />
          <ZoomIn className="w-5 h-5 shrink-0" />
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-3.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> Save Avatar
        </button>
      </div>
    </div>
  );
};
