---
name: ImageStudioLab Vibe-Coding Engine
description: A specialized workflow for converting Figma designs into production-ready React/Tailwind code using Google Gemini 3 (gemini-3-flash-preview) with advanced thinking capabilities. Designed for "Vibe Coding" where designers maintain pixel-perfect control while the AI handles the complex engineering logic and backend integration.
---

# ImageStudioLab Vibe-Coding Engine

This skill defines the standard procedure for the ImageStudioLab platform to bridge the gap between high-fidelity design (Figma) and production-grade code using the Gemini 3 API.

## Capabilities
- **Figma-to-Code Scaffolding**: Converts raw Figma JSON (from the Figma API) into clean, modular Next.js components matching the designer's exact intent.
- **Surgical Code Updates**: Instead of rewriting entire files, it performs surgical updates on specific Tailwind classes or logic blocks, preventing "Vibe Decay" and technical debt.
- **Design System Guardrails**: Enforces strict adherence to global Design Tokens (colors, spacing, typography). The AI is restricted from using any values not defined in the system.
- **Bi-Directional Sync Logic**: Supports a "Canvas-First" workflow where visual manipulations (dragging, resizing) are translated into AST-based code edits.
- **Abstracted Full-Stack**: Automatically generates Supabase schemas, API routes, and authentication logic based on natural language descriptions like "Make this button save to a Waitlist."
- **Experimental "Thinking Mode"**: Leverages Gemini 3's `HIGH` thinking level to resolve complex layout conflicts and plan multi-step application flows.

## Prerequisites
- **API Key**: Ensure `GEMINI_API_KEY` is present in the environment for model access.
- **SDK**: Use the `@google/genai` package (v1alpha or later for thinking features).
- **Design Context**: Always provide the current `theme.json` or design tokens to the model.

## Instructions for the Agent

When performing "Vibe Coding" tasks or generating UI, follow these steps:

1.  **Extract Design Context**: Analyze the provided Figma JSON or current UI state. Identify layout patterns (Flexbox, Grid) and repeated components.
2.  **Initialize Gemini 3**:
    - **Model**: `gemini-3-flash-preview` (mandatory).
    - **Config**: Set `thinkingLevel: 'HIGH'` for complex architectural changes or `MEDIUM` for simple style tweaks.
    - **Mime Type**: Always use `application/json` with a Zod-defined schema.
3.  **Apply Surgical Edits**:
    - If the user moves an element, identify the specific Tailwind class (e.g., `ml-4` -> `ml-8`) and update only that part of the code.
    - Use `data-isl-editable` attributes to mark layout-critical dimensions for the visual editor.
4.  **Enforce Tokens**: NEVER use raw hex codes or hardcoded pixels if a token exists. Map `#3b82f6` to `blue-500` or a custom brand token.

## Code Template (TypeScript)

Use this pattern for "Surgical UI Translation" using Gemini 3:

```typescript
import { GoogleGenAI } from '@google/genai';
import { z } from "zod";

// 1. Define the Change Schema for surgical updates
const UIUpdateSchema = z.object({
  componentPath: z.string(),
  updatedCode: z.string().describe("The full content of the component after surgical edits"),
  changesSummary: z.string(),
  newTokensUsed: z.array(z.string()).optional()
});

async function applyVibeEdit(
  originalCode: string, 
  userInstruction: string, 
  tokens: any, 
  thinking: 'HIGH' | 'MEDIUM' = 'HIGH'
) {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      // @ts-ignore - thinkingConfig is part of the v1alpha SDK
      thinkingConfig: { thinkingLevel: thinking }
    }
  });

  const prompt = `
    Context: You are the Lead Frontend Engineer at ImageStudioLab.
    Design Tokens: ${JSON.stringify(tokens)}
    
    Task: Apply the following edit to the code provided below. 
    Rule 1: Use ONLY values from the Design Tokens.
    Rule 2: Ensure the output is clean, responsive React/Tailwind code.
    Rule 3: Keep existing logic and imports intact unless explicitly asked to change.

    User Instruction: "${userInstruction}"
    
    Code to Edit:
    \`\`\`tsx
    ${originalCode}
    \`\`\`
  `;

  const result = await model.generateContent(prompt);
  const response = JSON.parse(result.response.text());
  
  return UIUpdateSchema.parse(response);
}
```

## Safety & Style Standards
- **Pixel Perfection**: Ensure `hover`, `active`, and `transition` states are applied to all interactive elements.
- **Accessibility**: Generate ARIA-compliant tags and ensure contrast ratios meet WCAG standards.
- **Responsiveness**: Always use mobile-first breakpoints (`md:`, `lg:`).
- **Clean AST**: Avoid "div-soup"; use semantic HTML (`main`, `section`, `nav`) where appropriate.
