export interface InfographicTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  gradient: string;
}

export const INFOGRAPHIC_TEMPLATES: InfographicTemplate[] = [
  {
    id: "vs-comparison",
    name: "Comparison (Vs Mode)",
    description: "Compare two concepts side-by-side with clear Dos and Don'ts visual cues.",
    icon: "⚖️",
    gradient: "from-blue-500 to-indigo-600",
    prompt: `
      Ultra-clean educational Instagram infographic about [TOPIC], split-screen vertical composition (9:16).

      **Center subject:**
      A central visual element representing [TOPIC] placed perfectly in the center, ultra-realistic, premium quality.
      A **thin vertical glowing line** divides the image into two equal halves (left and right).

      **Left side (❌ COMMON MISTAKES / MYTHS):**
      Slightly dull lighting, muted colors.
      Key points shown with **small icons + labels**, connected using dotted white lines.
      Red ❌ icon at the top-left.
      Short minimal labels (clean sans-serif font, readable on mobile).

      **Right side (✅ PRO TIPS / FACTS):**
      Bright, clean, premium lighting, cinematic clarity.
      Key points displayed neatly with **clear callout lines** and labels.
      Green ✅ icon at the top-right.

      **Top headline text (large, bold, centered):**
      "[TOPIC]"

      [USER_CONTENT_BLOCK]

      **Design style:**
      – Minimal, professional educational aesthetic
      – High contrast for mobile viewing
      – Soft shadows, premium depth
      – Clean typography
      – No clutter
      – Instagram-ready viral layout

      **Color palette:**
      Dark charcoal background, white text, accent colors (green for correct, red for wrong).

      **Rendering:**
      Ultra-realistic, 4K detail, sharp focus, studio lighting.

      **Branding:**
      Add a small, subtle watermark at the very bottom center: "Created by ImageStudioLab" with a tiny camera icon.
    `
  },
  {
    id: "step-by-step",
    name: "Step-by-Step Guide",
    description: "Break down complex processes into a clear, numbered visual roadmap.",
    icon: "👣",
    gradient: "from-emerald-500 to-teal-600",
    prompt: `
      Vertical 9:16 infographic showing a step-by-step guide for [TOPIC].
      
      **Layout:** A vertical flow chart or roadmap style.
      path connecting 3-4 distinct visual milestones from top to bottom.

      **Content:**
      Each step has a high-quality 3D icon or illustration representing that stage of [TOPIC].
      Clear bold numbers (1, 2, 3, 4) next to each step.
      Brief, punchy Titles for each step in clean white sans-serif font.

      **Header:**
      Large bold title at the top: "[TOPIC]"

      [USER_CONTENT_BLOCK]

      **Style:**
      Modern UI/UX aesthetic, glassmorphism elements, glowing connectors.
      Dark mode background (deep navy or black).
      Neon accent colors for steps.

      **Branding:**
      Add a small, subtle watermark at the very bottom center: "Created by ImageStudioLab" with a tiny camera icon.
    `
  },
  {
    id: "parts-breakdown",
    name: "Anatomy Breakdown",
    description: "Explode a subject to reveal and explain its component parts clearly.",
    icon: "🧩",
    gradient: "from-purple-500 to-pink-600",
    prompt: `
      Detailed "Anatomy of [TOPIC]" infographic, vertical 9:16 format.

      **Center Subject:**
      A large, detailed, high-fidelity 3D render or photo of [TOPIC] in the center.

      **Callouts:**
      Clean white lines radiating from specific parts of the subject to text labels on the sides.
      Labels should be short, descriptive, and easy to read.
      Include small icons next to key features.

      **Header:**
      "[TOPIC]" in bold, modern typography at the top.

      [USER_CONTENT_BLOCK]

      **Style:**
      Technical yet artistic. "Blueprint" aesthetic or clean "Apple-style" product breakdown.
      Neutral background (slate grey or soft black) to make the subject pop.

      **Branding:**
      Add a small, subtle watermark at the very bottom center: "Created by ImageStudioLab" with a tiny camera icon.
    `
  },
  {
    id: "listicle",
    name: "Top 5 List",
    description: "Showcase a curated list of top items, tools, or tips efficiently.",
    icon: "🏆",
    gradient: "from-amber-500 to-orange-600",
    prompt: `
      viral list infographic about [TOPIC], vertical 9:16.

      **Layout:**
      5 distinct horizontal rows or cards stacked vertically.
      Each card represents a key point about [TOPIC].

      **Card Content:**
      Left side: A clear, colorful icon or mini-illustration.
      Right side: Bold Title and a short 1-line description.

      **Header:**
      "[TOPIC]" bold header at the top.

      [USER_CONTENT_BLOCK]

      **Style:**
      Card-based UI design. Cards have a glass/frosted effect.
      Vibrant gradients for icons.
      Clean dark background.

      **Branding:**
      Add a small, subtle watermark at the very bottom center: "Created by ImageStudioLab" with a tiny camera icon.
    `
  }
];
