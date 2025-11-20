
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PolaroidFrame } from './components/PolaroidFrame';
import { Controls } from './components/Controls';
import { PolaroidConfig, FrameColor, FilterType, FontFamily } from './types';
import { generateAiCaption, editImageWithAi, generateAiSticker, generateMusicMetadata } from './services/geminiService';
import { audioGenerator } from './services/audioGenerator';
import { exportToImage, exportToVideo } from './services/videoExporter';

const INITIAL_CONFIG: PolaroidConfig = {
  image: null,
  mediaType: 'image',
  caption: "Summer of '98",
  frameColor: FrameColor.White,
  filter: FilterType.None,
  font: FontFamily.Caveat,
  rotation: -2,
  showTape: true,
  showTexture: true,
  date: "OCT 24",
  stickers: [],
  imageFit: 'cover',
  music: null,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<PolaroidConfig>(INITIAL_CONFIG);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const polaroidRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
        audioGenerator.stop();
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, []);

  const handleUpdate = useCallback((updates: Partial<PolaroidConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      // If we are updating the image via upload, set it as original
      if (updates.image && updates.image !== prev.image) {
        setOriginalImage(updates.image);
      }
      // If music is removed, stop playing
      if ('music' in updates && updates.music === null) {
          audioGenerator.stop();
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
          }
          setIsMusicPlaying(false);
      }
      return next;
    });
  }, []);

  // Helper to get image data for AI (handles both IMG and VIDEO source)
  const getMediaSnapshot = async (): Promise<string | null> => {
    if (!config.image) return null;

    if (config.mediaType === 'image') {
        return config.image;
    } else {
        // Capture frame from video
        const videoElement = polaroidRef.current?.querySelector('video');
        if (!videoElement) return null;

        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
    }
  };

  const handleGenerateCaption = async () => {
    if (!config.image) return;
    setIsGenerating(true);
    try {
      const imageData = await getMediaSnapshot();
      if (imageData) {
        const caption = await generateAiCaption(imageData);
        handleUpdate({ caption });
      }
    } catch (error) {
      console.error("Failed to generate caption", error);
      alert("AI Error: Check API Key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEdit = async (prompt: string) => {
    if (!config.image || config.mediaType === 'video') return;
    setIsGenerating(true);
    try {
      // Edit only works on static images for now
      const newImage = await editImageWithAi(config.image, prompt);
      setConfig(prev => ({ ...prev, image: newImage }));
    } catch (error) {
      console.error("Failed to edit image", error);
      alert("AI Error: Could not edit image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSticker = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const stickerImage = await generateAiSticker(prompt);
      const newSticker = {
        id: Date.now().toString(),
        image: stickerImage,
        x: Math.random() * 60 + 20, 
        y: Math.random() * 60 + 20,
        rotation: Math.random() * 40 - 20,
        scale: Math.random() * 0.5 + 0.8,
      };
      setConfig(prev => ({ ...prev, stickers: [...prev.stickers, newSticker] }));
    } catch (error) {
      console.error("Failed to generate sticker", error);
      alert("AI Error: Could not generate sticker.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!config.image) return;
    setIsGenerating(true);
    try {
        const snapshotData = await getMediaSnapshot();
        if (snapshotData) {
            const musicData = await generateMusicMetadata(snapshotData);
            handleUpdate({ music: musicData });
            
            // Auto play generated music
            audioGenerator.playGenerated(musicData);
            setIsMusicPlaying(true);
        }
    } catch (error) {
        console.error("Failed to generate music", error);
        alert("AI Error: Could not generate music vibe.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleToggleMusic = () => {
    if (!config.music) return;
    
    if (isMusicPlaying) {
        audioGenerator.stop();
        if (audioRef.current) audioRef.current.pause();
        setIsMusicPlaying(false);
    } else {
        if (config.music.source === 'generated') {
            audioGenerator.playGenerated(config.music);
        } else if (config.music.url) {
            if (!audioRef.current) {
                audioRef.current = new Audio(config.music.url);
                audioRef.current.loop = true;
            } else if (audioRef.current.src !== config.music.url) {
                audioRef.current.src = config.music.url;
            }
            audioRef.current.play();
        }
        setIsMusicPlaying(true);
    }
  };

  const handleRevertImage = () => {
    if (originalImage) {
      setConfig(prev => ({ ...prev, image: originalImage }));
    }
  };

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
        const videoEl = polaroidRef.current?.querySelector('video') || null;
        
        // Logic: Export video if it's a video file OR if there is music attached
        const shouldExportVideo = config.mediaType === 'video' || config.music;

        if (shouldExportVideo) {
             // 1. Prepare Video Source
             let originalMutedState = true;
             if (config.mediaType === 'video' && videoEl) {
                originalMutedState = videoEl.muted;
                videoEl.muted = false; // Unmute to capture audio stream
                videoEl.currentTime = 0;
                try {
                  await videoEl.play();
                } catch(e) {
                  console.warn("Autoplay for export prevented", e);
                }
            }

            // 2. Prepare Audio Source (Generated Music)
            let audioStream = null;
            let wasMusicPlaying = isMusicPlaying;
            
            if (config.music && config.music.source === 'generated') {
                 // Ensure generator is running if not already
                 if (!isMusicPlaying) {
                     audioGenerator.playGenerated(config.music);
                 }
                 audioStream = audioGenerator.getAudioStream();
            }

            await exportToVideo(config, videoEl, audioStream);
            
            // 3. Restore States
            if (config.music && config.music.source === 'generated' && !wasMusicPlaying) {
                audioGenerator.stop();
            }
            if (config.mediaType === 'video' && videoEl) {
                videoEl.muted = originalMutedState;
                // Ensure it keeps looping if it was supposed to
                if (!originalMutedState) {
                    // If user had it unmuted, keep playing
                }
            }
        } else {
            // Static Image Export
            const dataUrl = await exportToImage(config, videoEl);
            const link = document.createElement('a');
            link.download = `retrosnap-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        }
    } catch (err) {
        console.error("Export failed", err);
        alert("Could not save Polaroid.");
    } finally {
        setIsExporting(false);
    }
  }, [config, isMusicPlaying]);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-zinc-950">
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_center,#18181b_0%,#09090b_100%)]">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="p-10"> 
                <PolaroidFrame 
                    config={config} 
                    containerRef={polaroidRef}
                />
            </div>

            {!config.image && (
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 text-sm pointer-events-none animate-pulse">
                    Upload a photo or video to start
                 </div>
            )}
            
            {isExporting && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center flex-col">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-mono animate-pulse">Developing Film...</p>
                </div>
            )}
        </div>

        {/* Sidebar Controls */}
        <Controls 
            config={config}
            onUpdate={handleUpdate}
            onGenerateCaption={handleGenerateCaption}
            onGenerateEdit={handleGenerateEdit}
            onGenerateSticker={handleGenerateSticker}
            onGenerateMusic={handleGenerateMusic}
            onToggleMusic={handleToggleMusic}
            isMusicPlaying={isMusicPlaying}
            onRevertImage={handleRevertImage}
            onDownload={handleDownload}
            isGenerating={isGenerating}
            hasOriginalImage={!!originalImage && originalImage !== config.image}
        />
    </div>
  );
};

export default App;
