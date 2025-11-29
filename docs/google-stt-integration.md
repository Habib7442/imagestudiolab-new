# Google Cloud Speech-to-Text Integration

## Overview
Replaced Vapi.ai with Google Cloud Speech-to-Text API for voice input in the Photoshoot feature. This implementation follows Next.js best practices by keeping sensitive credentials on the server side.

## Architecture

### Client-Side (Browser)
- **Component**: `VoiceControl.tsx`
- **Responsibilities**:
  - Capture audio using browser's `MediaRecorder` API
  - Send audio blob to Next.js API route
  - Display recording state to user
  - Update prompt with transcription result

### Server-Side (API Route)
- **Route**: `app/api/transcribe/route.ts`
- **Responsibilities**:
  - Receive audio blob from client
  - Authenticate with Google Cloud using service account key
  - Call Google Speech-to-Text API
  - Return transcription text to client

## Setup Instructions

### 1. Service Account Key
Place your `stt.json` file (Google Cloud service account key) in the project root:
```
e:\Mob Dev\imagestudiolab\stt.json
```

**Important**: This file is gitignored and should NEVER be committed to version control.

### 2. Dependencies
```bash
npm install @google-cloud/speech
```

### 3. API Configuration
The transcription API is configured with:
- **Encoding**: WEBM_OPUS (browser default)
- **Sample Rate**: 48000 Hz
- **Language**: en-US
- **Features**: Automatic punctuation enabled

## User Flow

1. **Upload Image**: User uploads their photo
2. **Click Microphone**: Click the inline mic button in textarea
3. **Record**: Browser requests microphone permission (first time only)
4. **Speak**: User describes their desired photoshoot
5. **Stop Recording**: Click mic button again to stop
6. **Transcribe**: Audio is sent to `/api/transcribe`
7. **Display**: Transcription appears in textarea
8. **Auto-Generate**: System automatically starts generation after 0.5s

## Technical Details

### Audio Format
- **Container**: WebM
- **Codec**: Opus
- **MIME Type**: `audio/webm;codecs=opus`

### MediaRecorder API
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});
```

### API Request Flow
```
Client (Browser)
  ↓ Audio Blob
Next.js API Route (/api/transcribe)
  ↓ Base64 Audio
Google Cloud Speech-to-Text API
  ↓ Transcription Text
Next.js API Route
  ↓ JSON Response
Client (Browser) → Update Textarea
```

## Security

### ✅ Best Practices
- Service account key stored on server only
- API route handles all Google Cloud authentication
- Client never sees credentials
- Audio data transmitted over HTTPS

### ❌ What NOT to Do
- Never import `@google-cloud/speech` in client components
- Never expose service account key in environment variables accessible to browser
- Never use `NEXT_PUBLIC_*` prefix for Google Cloud credentials

## Error Handling

### Client-Side
- Microphone permission denied → Alert user
- Network error → Alert user to retry
- Transcription failed → Show error message

### Server-Side
- Invalid audio format → Return 500 error
- Google API error → Log details, return generic error to client
- Missing credentials → Fail gracefully with error message

## Future Enhancements
- Add real-time streaming transcription
- Support multiple languages
- Add speaker diarization
- Implement custom vocabulary/phrases
- Add confidence scores display

## Cost Optimization
- Use standard model (not premium) for cost efficiency
- Consider caching common phrases
- Implement request rate limiting
- Monitor usage via Google Cloud Console

## Troubleshooting

### "Microphone permission denied"
- User must grant permission in browser
- Check browser settings if permission was previously denied

### "Transcription failed"
- Verify `stt.json` is in correct location
- Check Google Cloud API is enabled
- Verify service account has Speech-to-Text permissions
- Check audio format is supported

### "No transcription returned"
- Audio may be too short (< 1 second)
- Background noise too high
- Microphone not working properly
