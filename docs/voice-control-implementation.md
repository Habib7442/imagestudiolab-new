# Voice Control Implementation for Photoshoot Feature

## Overview
Implemented voice-based editing using Vapi.ai for the AI Photoshoot feature. Users can now describe their desired photoshoot using voice, and the system will automatically generate the image.

## Features

### 1. **Inline Microphone Button**
- Added a microphone button directly in the prompt textarea
- Only visible when a user image is uploaded
- Visual feedback:
  - **Inactive**: Fuchsia/pink background
  - **Active (listening)**: Red background with pulse animation
  - **Speaking**: Microphone icon pulses

### 2. **Real-Time Speech-to-Text**
- As the user speaks, the text appears in the textarea in real-time
- Uses Vapi's transcript events (both partial and final)
- Provides immediate visual feedback of what's being captured

### 3. **Auto-Generation**
- When the user stops speaking (final transcript detected):
  1. The prompt is finalized in the textarea
  2. After 0.5 seconds, the generation process starts automatically
  3. No need to manually click "Generate Photoshoot"

### 4. **Two Voice Input Options**
Users can activate voice input in two ways:
1. **Inline Button**: Click the microphone icon in the textarea
2. **Floating Button**: Click the floating microphone button (bottom-right)

Both buttons control the same voice session and show synchronized state.

## Technical Implementation

### Components Modified

#### 1. `VoiceControl.tsx`
- Converted to `forwardRef` to expose methods to parent
- Added `useImperativeHandle` to expose `toggle()` method
- Added `onVoiceStateChange` callback prop
- Listens to Vapi transcript events:
  - `partial`: Updates prompt in real-time
  - `final`: Triggers auto-generation
- Simplified system prompt to be a "passive listener"
- Removed complex tool-calling logic in favor of transcript-driven flow

#### 2. `PhotoshootInterface.tsx`
- Added voice state tracking (`isVoiceActive`, `isVoiceSpeaking`)
- Added `voiceControlRef` to control voice session from inline button
- Added inline microphone button in textarea with conditional rendering
- Connected voice state changes to update button appearance

### Key Code Patterns

```tsx
// Expose methods via ref
useImperativeHandle(ref, () => ({
  toggle: toggleVapi,
  isActive: isSessionActive,
}));

// Handle transcripts
vapi.on("message", (message: any) => {
  if (message.type === "transcript") {
    const transcript = message.transcript;
    if (transcript) {
      onPromptChange(transcript); // Real-time update
    }
    if (message.transcriptType === "final") {
      setTimeout(() => {
        onGenerate(transcript); // Auto-generate
      }, 500);
    }
  }
});
```

## User Flow

1. **Upload Image**: User uploads their photo
2. **Activate Voice**: Click microphone (inline or floating)
3. **Speak**: User describes their desired photoshoot
   - Text appears in real-time in the textarea
4. **Stop Speaking**: User finishes their description
5. **Auto-Generate**: System automatically starts generation after 0.5s
6. **View Result**: Generated image appears on the right panel

## Environment Setup

Ensure you have the Vapi public key in `.env.local`:
```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
```

## Dependencies
- `@vapi-ai/web`: Core Vapi SDK
- `@vapi-ai/client-sdk-react`: React-specific utilities (installed but not actively used)

## Future Enhancements
- Add visual waveform during speech
- Support for editing existing images via voice
- Voice commands for filter selection
- Multi-language support
