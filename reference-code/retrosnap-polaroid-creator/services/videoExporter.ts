
import { PolaroidConfig, FrameColor, FontFamily } from '../types';

const FRAME_COLORS: Record<FrameColor, string> = {
    [FrameColor.White]: '#f4f4f4',
    [FrameColor.Cream]: '#fdfbf7',
    [FrameColor.Black]: '#1a1a1a',
    [FrameColor.Pink]: '#fee2e2',
    [FrameColor.Blue]: '#e0f2fe',
};

// Approximate font mappings matching index.html
const FONT_FAMILIES: Record<FontFamily, string> = {
    [FontFamily.Caveat]: 'Caveat, cursive',
    [FontFamily.PermanentMarker]: 'Permanent Marker, cursive',
    [FontFamily.ShadowsIntoLight]: 'Shadows Into Light, cursive',
    [FontFamily.Courier]: 'Courier Prime, monospace',
};

// Helper to load images safely
const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
};

// Shared rendering logic
async function drawPolaroidFrame(
    ctx: CanvasRenderingContext2D,
    config: PolaroidConfig,
    width: number,
    height: number,
    resources: { mainImage: HTMLImageElement | null, stickerImages: (HTMLImageElement | null)[] },
    videoElement: HTMLVideoElement | null
) {
    // 1. Draw Background Frame
    ctx.fillStyle = FRAME_COLORS[config.frameColor];
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Media Area Background (Black/Gray)
    // Base design: 320px card width, 20px padding. Scaled by ~2 for high res (640w)
    // Padding: 40px
    const padding = 40;
    const mediaWidth = width - (padding * 2);
    const mediaHeight = 520; // Aspect ratio based on UI
    const mediaX = padding;
    const mediaY = padding;

    ctx.fillStyle = '#111827'; // gray-900
    ctx.fillRect(mediaX, mediaY, mediaWidth, mediaHeight);

    // 3. Draw Media
    ctx.save();
    ctx.beginPath();
    ctx.rect(mediaX, mediaY, mediaWidth, mediaHeight);
    ctx.clip();
    
    // Apply Filters
    if (config.filter !== 'none') {
        ctx.filter = config.filter;
    }

    const source = config.mediaType === 'video' ? videoElement : resources.mainImage;
    
    if (source) {
        // Calculate Object Fit
        const srcW = config.mediaType === 'video' ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).width;
        const srcH = config.mediaType === 'video' ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).height;
        
        let drawW, drawH, drawX, drawY;
        // Avoid division by zero
        const safeSrcH = srcH || 1;
        const ratio = srcW / safeSrcH;
        const targetRatio = mediaWidth / mediaHeight;

        if (config.imageFit === 'cover') {
                if (ratio > targetRatio) {
                    drawH = mediaHeight;
                    drawW = drawH * ratio;
                    drawX = mediaX + (mediaWidth - drawW) / 2;
                    drawY = mediaY;
                } else {
                    drawW = mediaWidth;
                    drawH = drawW / ratio;
                    drawX = mediaX;
                    drawY = mediaY + (mediaHeight - drawH) / 2;
                }
        } else {
            // Contain Mode: Draw Blur Background first
            ctx.save();
            ctx.filter = (config.filter !== 'none' ? config.filter + ' ' : '') + 'blur(20px)';
            ctx.globalAlpha = 0.6;
            // Draw stretched bg
            ctx.drawImage(source, mediaX - 20, mediaY - 20, mediaWidth + 40, mediaHeight + 40);
            ctx.restore();

            if (ratio > targetRatio) {
                drawW = mediaWidth;
                drawH = drawW / ratio;
                drawX = mediaX;
                drawY = mediaY + (mediaHeight - drawH) / 2;
            } else {
                drawH = mediaHeight;
                drawW = drawH * ratio;
                drawX = mediaX + (mediaWidth - drawW) / 2;
                drawY = mediaY;
            }
        }

        ctx.drawImage(source, drawX, drawY, drawW, drawH);
    }
    ctx.restore();

    // 4. Texture Overlay
    if (config.showTexture) {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(mediaX, mediaY, mediaWidth, mediaHeight);
    }

    // 5. Vignette
    const gradient = ctx.createRadialGradient(width/2, mediaY + mediaHeight/2, mediaHeight/3, width/2, mediaY + mediaHeight/2, mediaHeight);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(mediaX, mediaY, mediaWidth, mediaHeight);

    // 6. Tape
    if (config.showTape) {
        ctx.save();
        ctx.translate(width/2, 0);
        ctx.rotate(1 * Math.PI / 180);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 5;
        ctx.fillRect(-50, -10, 100, 40); 
        ctx.restore();
    }

    // 7. Text
    const textColor = config.frameColor === FrameColor.Black ? '#e5e7eb' : '#1f2937';
    const dateColor = config.frameColor === FrameColor.Black ? '#9ca3af' : '#9ca3af';

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `48px ${FONT_FAMILIES[config.font]}`; 
    
    // Wrap text logic simplified
    const textY = mediaY + mediaHeight + 40;
    ctx.fillText(config.caption, width / 2, textY);

    // Date
    ctx.fillStyle = dateColor;
    ctx.font = `20px ${FONT_FAMILIES[FontFamily.Courier]}`;
    ctx.textAlign = 'right';
    ctx.fillText(config.date, width - 20, height - 40);

    // Music Caption
    if (config.music) {
        ctx.textAlign = 'left';
        ctx.font = `18px ${FONT_FAMILIES[FontFamily.Courier]}`;
        ctx.fillText(`🎵 ${config.music.title} - ${config.music.artist}`, 20, height - 40);
    }

    // 8. Stickers
    config.stickers.forEach((sticker, index) => {
        const img = resources.stickerImages[index];
        if (img) {
            const sx = (sticker.x / 100) * width;
            const sy = (sticker.y / 100) * height;
            const sSize = 160 * sticker.scale; 
            
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            ctx.drawImage(img, -sSize/2, -sSize/2, sSize, sSize);
            ctx.restore();
        }
    });
}

export const exportToImage = async (
    config: PolaroidConfig,
    videoElement: HTMLVideoElement | null
): Promise<string> => {
    const canvas = document.createElement('canvas');
    // High res output
    const width = 640;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");

    // Load resources
    const stickerImages = await Promise.all(config.stickers.map(s => loadImage(s.image)));
    let mainImage: HTMLImageElement | null = null;
    if (config.mediaType === 'image' && config.image) {
        mainImage = await loadImage(config.image);
    }

    await document.fonts.ready; // Ensure fonts are loaded

    await drawPolaroidFrame(ctx, config, width, height, { mainImage, stickerImages }, videoElement);

    return canvas.toDataURL('image/png');
};

export const exportToVideo = async (
    config: PolaroidConfig, 
    videoElement: HTMLVideoElement | null,
    audioStream: MediaStream | null
): Promise<void> => {
    
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");

    // Determine duration
    let duration = 5000; 
    if (config.mediaType === 'video' && videoElement) {
        duration = Math.min(videoElement.duration * 1000, 30000);
        if (isNaN(duration) || duration === 0) duration = 10000;
    } else if (config.music) {
        duration = 15000; 
    }

    const canvasStream = canvas.captureStream(30); 
    const tracks = [...canvasStream.getVideoTracks()];
    
    // Mix Audio
    if (config.mediaType === 'video' && videoElement) {
         try {
             // @ts-ignore
             const videoStream = videoElement.captureStream ? videoElement.captureStream() : videoElement.mozCaptureStream ? videoElement.mozCaptureStream() : null;
             if (videoStream) {
                 tracks.push(...videoStream.getAudioTracks());
             }
         } catch (e) {
             console.warn("Could not capture video audio", e);
         }
    }
    if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
    }

    const combinedStream = new MediaStream(tracks);
    const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retrosnap-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    };

    mediaRecorder.start();

    // Animation Loop
    const startTime = Date.now();
    
    // Load resources
    const stickerImages = await Promise.all(config.stickers.map(s => loadImage(s.image)));
    let mainImage: HTMLImageElement | null = null;
    if (config.mediaType === 'image' && config.image) {
        mainImage = await loadImage(config.image);
    }

    await document.fonts.ready;

    const draw = async () => {
        if (Date.now() - startTime > duration) {
            mediaRecorder.stop();
            return;
        }
        await drawPolaroidFrame(ctx, config, width, height, { mainImage, stickerImages }, videoElement);
        requestAnimationFrame(draw);
    };

    draw();
};
