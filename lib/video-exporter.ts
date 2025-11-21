import { Polaroid, usePolaroidStore } from "@/store/use-polaroid-store";
import { THEMES, FILTERS } from "@/constants/polaroid-presets";

export const exportVideo = async (polaroid: Polaroid) => {
  const cardId = `polaroid-${polaroid.id}`;
  const cardElement = document.getElementById(cardId);
  
  if (!cardElement) {
    console.error("Polaroid card element not found");
    return;
  }

  const videoElement = cardElement.querySelector("video");
  if (!videoElement) {
    console.error("Video element not found inside polaroid card");
    return;
  }

  // Configuration for Canvas Export (1080x1080 Square)
  const CANVAS_SIZE = 1080;
  const UI_CARD_WIDTH = 220;
  // Target card width in export (approx 40% of canvas width)
  const TARGET_CARD_WIDTH = 440; 
  const BASE_SCALE = TARGET_CARD_WIDTH / UI_CARD_WIDTH;

  // Card Dimensions (Unscaled)
  const CARD_PADDING_X = 12;
  const CARD_PADDING_TOP = 12;
  const CARD_PADDING_BOTTOM = 40;
  const INNER_WIDTH = UI_CARD_WIDTH - (CARD_PADDING_X * 2);
  const INNER_HEIGHT = INNER_WIDTH * (5 / 4);
  const UI_CARD_HEIGHT = CARD_PADDING_TOP + INNER_HEIGHT + CARD_PADDING_BOTTOM;

  // Setup Canvas
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    console.error("Failed to get canvas context");
    return;
  }

  // Get Store State
  const { backgroundColor } = usePolaroidStore.getState();

  // Get Theme and Filter
  const theme = THEMES[polaroid.theme];
  const filterDef = FILTERS[polaroid.filter];
  const appliedFilter = polaroid.customFilter || (filterDef ? filterDef.filter : "") || "none";

  // Ensure fonts are loaded
  await document.fonts.ready;

  // Setup MediaRecorder
  const stream = canvas.captureStream(30); // 30 FPS
  
  // Add audio track
  // @ts-ignore
  if (videoElement.captureStream || videoElement.mozCaptureStream) {
      // @ts-ignore
      const videoStream = videoElement.captureStream ? videoElement.captureStream() : videoElement.mozCaptureStream();
      const audioTracks = videoStream.getAudioTracks();
      if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
      }
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 8000000 // 8 Mbps
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `polaroid-video-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Start Recording
  mediaRecorder.start();
  
  const duration = Math.min(videoElement.duration * 1000, 30000); // Max 30 seconds
  const startTime = Date.now();
  
  // Ensure video is playing
  videoElement.currentTime = 0;
  await videoElement.play();

  const draw = () => {
    if (Date.now() - startTime > duration) {
      mediaRecorder.stop();
      return;
    }

    // 1. Draw Canvas Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Transform Context for Card
    ctx.save();
    
    // Move to Center
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    
    // Apply Position (Scaled)
    ctx.translate(polaroid.position.x * BASE_SCALE, polaroid.position.y * BASE_SCALE);
    
    // Apply Rotation
    ctx.rotate((polaroid.rotation * Math.PI) / 180);
    
    // Apply Scale (User Scale * Base Scale)
    const finalScale = (polaroid.scale || 1) * BASE_SCALE;
    ctx.scale(finalScale, finalScale);

    // Draw Card centered at (0,0)
    // Offset by half width/height to center
    const drawX = -UI_CARD_WIDTH / 2;
    const drawY = -UI_CARD_HEIGHT / 2;

    // A. Draw Card Frame
    ctx.fillStyle = theme.frameColor;
    
    // Parse and Apply Shadow from Theme
    // Format: "0 4px 20px rgba(0,0,0,0.15)" -> x y blur color
    // We need to handle the parsing carefully
    const shadowParts = theme.shadow.match(/(-?\d+px|-?\d+)\s+(-?\d+px|-?\d+)\s+(-?\d+px|-?\d+)\s+(.+)/);
    
    if (shadowParts) {
        const offsetX = parseFloat(shadowParts[1]);
        const offsetY = parseFloat(shadowParts[2]);
        const blur = parseFloat(shadowParts[3]);
        const color = shadowParts[4];

        ctx.shadowOffsetX = offsetX * BASE_SCALE;
        ctx.shadowOffsetY = offsetY * BASE_SCALE;
        ctx.shadowBlur = blur * BASE_SCALE;
        ctx.shadowColor = color;
    } else {
        // Fallback if parsing fails
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 20 * BASE_SCALE;
        ctx.shadowOffsetY = 10 * BASE_SCALE;
    }

    ctx.fillRect(drawX, drawY, UI_CARD_WIDTH, UI_CARD_HEIGHT);
    
    // Reset Shadow for subsequent drawings
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // B. Draw Image Area Background (Black)
    const imgX = drawX + CARD_PADDING_X;
    const imgY = drawY + CARD_PADDING_TOP;
    ctx.fillStyle = "#000000";
    ctx.fillRect(imgX, imgY, INNER_WIDTH, INNER_HEIGHT);

    // C. Draw Video
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgX, imgY, INNER_WIDTH, INNER_HEIGHT);
    ctx.clip();

    ctx.filter = appliedFilter;

    // Object-Fit: Cover Logic
    const vw = videoElement.videoWidth;
    const vh = videoElement.videoHeight;
    const vr = vw / vh;
    const ir = INNER_WIDTH / INNER_HEIGHT;

    let sx, sy, sw, sh;

    if (vr > ir) {
      sh = vh;
      sw = vh * ir;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = vw / ir;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    ctx.drawImage(videoElement, sx, sy, sw, sh, imgX, imgY, INNER_WIDTH, INNER_HEIGHT);
    ctx.restore();

    // D. Draw Caption
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const fontSize = 16; // Base font size
    ctx.font = `${fontSize}px 'Caveat', cursive`;
    
    const text = polaroid.caption || "Add a caption...";
    const textX = 0; // Centered horizontally relative to card center
    const textY = imgY + INNER_HEIGHT + 12; // 12px margin below image
    const maxWidth = UI_CARD_WIDTH - 24;
    const lineHeight = fontSize * 1.2;

    wrapText(ctx, text, textX, textY, maxWidth, lineHeight);

    ctx.restore(); // Restore transform

    // Request next frame
    requestAnimationFrame(draw);
  };

  draw();
};

// Helper for text wrapping
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
