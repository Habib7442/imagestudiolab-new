import { SpeechClient } from '@google-cloud/speech';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Speech-to-Text client with credentials
// In production (Vercel), use environment variables
// In development, use the local file
const client = new SpeechClient(
  process.env.GOOGLE_CLOUD_CREDENTIALS
    ? {
        credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
      }
    : {
        keyFilename: './stt.json',
      }
);

export async function POST(request: NextRequest) {
  try {
    // Get the audio file data from the request body
    const audioBlob = await request.blob();
    const audioContent = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    
    // Configure the request for the Google API
    const config = {
      encoding: 'WEBM_OPUS' as const,
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    };

    const audio = {
      content: audioContent,
    };

    const apiRequest = {
      config: config,
      audio: audio,
    };

    // Call the Google Speech-to-Text API (non-streaming)
    const [response] = await client.recognize(apiRequest);
    
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join('\n') || '';

    // Return the transcription text to the client
    return NextResponse.json({ transcription }, { status: 200 });

  } catch (error: any) {
    console.error('Transcription ERROR:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: error.message }, 
      { status: 500 }
    );
  }
}
