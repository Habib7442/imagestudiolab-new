
import React from 'react';
import { PolaroidConfig, FrameColor } from '../types';
import { Music } from 'lucide-react';

interface PolaroidFrameProps {
  config: PolaroidConfig;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const PolaroidFrame: React.FC<PolaroidFrameProps> = ({ config, containerRef }) => {
  const { image, caption, frameColor, filter, font, rotation, showTape, showTexture, date, stickers, imageFit, music, mediaType } = config;

  // Dynamic text color based on frame brightness
  const textColor = frameColor === FrameColor.Black ? 'text-gray-200' : 'text-gray-800';
  const dateColor = frameColor === FrameColor.Black ? 'text-gray-400' : 'text-gray-400';

  return (
    <div 
      ref={containerRef}
      className={`relative transition-transform duration-500 ease-in-out shadow-2xl ${frameColor} p-5 pb-20 flex flex-col items-center box-border`}
      style={{
        width: '320px',
        height: '450px', // Increased height for music caption
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Tape Effect */}
      {showTape && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm z-20" style={{ clipPath: 'polygon(2% 0, 98% 5%, 100% 100%, 0 95%)' }}></div>
      )}

      {/* Stickers Layer */}
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
            width: '80px',
            height: '80px',
          }}
        >
           <img 
             src={sticker.image} 
             alt="sticker" 
             className="w-full h-full object-contain drop-shadow-md"
           />
        </div>
      ))}

      {/* Photo/Video Area */}
      <div className="relative w-full h-[260px] bg-gray-900 overflow-hidden flex items-center justify-center shadow-inner group">
        {image ? (
          <>
            {/* BACKGROUND LAYER (For 'Contain' fit) */}
            {imageFit === 'contain' && (
                mediaType === 'video' ? (
                    <video 
                        src={image}
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110"
                        style={{ filter: filter ? `${filter} blur(16px)` : 'blur(16px)' }} 
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img 
                        src={image} 
                        alt="Background Blur" 
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110"
                        style={{ filter: filter ? `${filter} blur(16px)` : 'blur(16px)' }} 
                    />
                )
            )}

            {/* MAIN MEDIA LAYER */}
            {mediaType === 'video' ? (
                 <video
                    src={image}
                    className={`relative z-10 w-full h-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-all duration-300`}
                    style={{ filter: filter }}
                    autoPlay
                    muted
                    loop
                    playsInline
                    // Special attribute for snapshotting if we add canvas logic later
                    crossOrigin="anonymous" 
                 />
            ) : (
                <img 
                    src={image} 
                    alt="Memory" 
                    className={`relative z-10 w-full h-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-all duration-300`}
                    style={{ filter: filter }}
                />
            )}

             {/* Texture Overlay */}
             {showTexture && (
               <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-noise bg-[length:100px_100px] z-20"></div>
             )}
             {/* Vignette */}
             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.3)_100%)] z-20"></div>
          </>
        ) : (
          <div className="text-gray-600 flex flex-col items-center justify-center h-full bg-gray-800 w-full">
            <span className="text-4xl mb-2 opacity-50">📷</span>
            <span className="text-xs uppercase tracking-widest opacity-50">No Media</span>
          </div>
        )}
      </div>

      {/* Caption Area */}
      <div className="mt-6 w-full text-center px-2 relative">
        <p className={`${font} ${textColor} text-2xl leading-tight break-words`}>
          {caption}
        </p>
        {date && (
            <p className={`font-typewriter ${dateColor} text-[10px] absolute bottom-[-45px] right-2 tracking-wider opacity-60`}>
                {date}
            </p>
        )}
        
        {/* Music Stamp */}
        {music && (
            <div className={`absolute -bottom-10 left-0 flex items-center gap-1.5 ${dateColor} opacity-80`}>
                <Music size={10} />
                <span className="text-[9px] font-typewriter tracking-widest uppercase max-w-[180px] truncate">
                    {music.title} - {music.artist}
                </span>
            </div>
        )}
      </div>
    </div>
  );
};
