export interface TrendingTemplate {
  id: string;
  name: string;
  image: string;
  prompt: string;
}

export const MUSIC_TREND_TEMPLATES: TrendingTemplate[] = [
  {
    id: "calm-vibe",
    name: "Calm Studio Vibe",
    image: "/trendings/music/calm.png",
    prompt: `Ultra-cinematic studio portrait using the uploaded person as the main subject, preserve exact facial likeness, skin tone, hairstyle, and expression.

The subject is sitting calmly on a glowing neon-green circular stool inspired by a Spotify logo, wearing over-ear headphones, eyes closed, immersed in music.
Relaxed posture, hands gently clasped, peaceful expression.

Outfit: oversized pastel t-shirt, relaxed cargo pants, black leather boots.

Environment: premium dark music studio with deep red ambient lighting and subtle atmospheric haze.

Behind the subject is a LARGE, SHARP, CLEAR Spotify-style interface screen.
The Spotify playlist UI is HIGH-RESOLUTION and FULLY LEGIBLE:
– song names clearly readable  
– artist names clearly readable  
– album covers sharp and distinct  
– playlist titles visible  
– interface looks like a real Spotify desktop screen  
NO blur on text, NO motion blur on UI, crisp typography.

Music visualized as glowing golden musical notes and sound waves floating upward from the headphones, softly animated, not blocking the text.

Lighting: cinematic red fill light, soft rim light, green glow from the stool reflecting on the subject.
High contrast, professional studio lighting.

Hyper-realistic photography, editorial quality, ultra-sharp focus, shallow depth of field ONLY on background objects, NOT on the Spotify screen.
8K clarity, photorealistic, no watermark.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "confident-night",
    name: "Confident Night Listener",
    image: "/trendings/music/confident-night-listener.png",
    prompt: `Ultra-cinematic portrait using uploaded person, exact facial likeness preserved.
Subject seated confidently on a glowing neon-green Spotify-inspired stool, legs relaxed, headphones on.

Behind them: a SHARP, LEGIBLE Spotify desktop interface with clearly readable song titles, artists, and album covers.
Dark red studio lighting with subtle smoke.

Golden musical notes drift diagonally across the frame without blocking text.
Mood: calm, confident, quietly sexy.

Editorial music campaign photography, ultra-realistic, high contrast.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "soft-seductive",
    name: "Soft Glow",
    image: "/trendings/music/soft-glow.png",
    prompt: `Premium cinematic portrait with uploaded person, realistic skin texture preserved.
Soft sensual pose, eyes closed, headphones slightly tilted.

Spotify playlist UI behind is bright, clear, readable, glowing softly.
Text is crisp, modern typography, desktop interface realism.

Lighting: warm red ambient + green neon reflections, subtle haze.
Music notes float gently like sparks.

Minimal, intimate, sexy but tasteful.
Luxury editorial photography.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "spotify-after-dark",
    name: "Spotify After Dark",
    image: "/trendings/music/spotify-after-dark.png",
    prompt: `Dark, moody studio portrait using uploaded person.
Subject seated on glowing Spotify-style seat, relaxed streetwear.

Behind them: crystal-clear Spotify playlist screen, readable song names and artists, sharp album covers.
Black-red color palette with neon green accent.

Music energy appears as glowing waveform lines wrapping the frame edges.
Feels bold, night-time, premium.

High-end commercial photography.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "reel-hero",
    name: "Viral Reel Hero",
    image: "/trendings/music/reel-hero.png",
    prompt: `Create a viral Instagram Reel hero frame using uploaded person.
Strong centered composition, confident posture, headphones on.

Large Spotify playlist UI behind the subject, perfectly legible and sharp.
UI slightly angled for depth but text remains clear.

Golden music notes burst upward dynamically.
Lighting optimized for social media punch: high contrast, vibrant red & green.

Photorealistic, scroll-stopping.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "minimal-sexy",
    name: "Minimal Sexy Campaign",
    image: "/trendings/music/minimal-sexy-campaign.png",
    prompt: `Ultra-minimal luxury portrait using uploaded person.
Single glowing Spotify seat, clean studio floor.

Spotify playlist screen behind is clean, sharp, readable, no clutter.
Only 1–2 playlists visible, crystal-clear text.

Lighting is soft red with controlled shadows.
Music notes appear minimal and elegant.

Apple-level minimalism meets Spotify energy.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "music-moment",
    name: "Music Moment Freeze",
    image: "/trendings/music/magical-moment-freeze.png",
    prompt: `Freeze a cinematic moment where music hits emotionally.
Uploaded person with calm, sensual expression, eyes closed.

Spotify UI behind is ultra-clear, readable song titles and artists.
Text is sharp, not stylized.

Golden notes appear frozen mid-air like sparks.
Deep red haze, green neon glow from seat.

Emotional, cinematic, timeless.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "confident-creator",
    name: "Confident Creator Vibe",
    image: "/trendings/music/confident-creator-vibe.png",
    prompt: `Modern creator-style portrait using uploaded person.
Cool, relaxed posture, headphones on, subtle confidence.

Spotify playlist screen behind is fully legible, desktop UI realism.
Clean typography, readable text, no blur.

Lighting: neon red rim light + green accent.
Music notes appear as clean light trails.

Perfect for creators, reels, brand collabs.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "editorial-poster",
    name: "Editorial Music Poster",
    image: "/trendings/music/editorial-music-poster.png",
    prompt: `High-fashion editorial portrait using uploaded person.
Seated pose styled like a magazine cover shoot.

Spotify playlist interface behind is sharp, readable, perfectly framed.
Text and album art are crisp and clear.

Golden-orange musical notes curve across top of frame.
Lighting is dramatic but controlled.

Looks like a global music campaign poster.

--v 6 --style raw --iw 1.6 --ar 9:16`
  },
  {
    id: "icon-moment",
    name: "Spotify Icon Moment",
    image: "/trendings/music/spotify-icon-moment.png",
    prompt: `Create an iconic Spotify-style portrait using uploaded person.
Subject sits on glowing green Spotify-inspired stool, calm and sexy.

Large Spotify UI behind is crystal clear, readable, high-resolution.
Song names and artists are fully legible.

Music notes glow softly, framing the subject without covering text.
Cinematic red lighting, professional studio depth.

Timeless, premium, viral-ready.

--v 6 --style raw --iw 1.6 --ar 9:16`
  }
];

export const MUSIC_TREND_NEGATIVE_PROMPT = "blurred text, unreadable UI, fake words, gibberish text, motion blur on screen, distorted typography, cartoon, illustration, watermark, blurred text, unreadable text, distorted UI, fake text, gibberish words, motion blur on screen, soft focus UI, low resolution interface, watermark, logo distortion, cartoon, illustration";
