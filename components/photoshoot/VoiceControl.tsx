"use client";

import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControlProps {
  onTranscriptionComplete: (text: string) => void;
  hasUserImage: boolean;
}

export interface VoiceControlRef {
  toggle: () => void;
  isActive: boolean;
}

const VoiceControl = forwardRef<VoiceControlRef, VoiceControlProps>(({
  onTranscriptionComplete,
  hasUserImage,
}, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Expose toggle method to parent
  useImperativeHandle(ref, () => ({
    toggle: toggleRecording,
    isActive: isRecording,
  }));

  const startRecording = async () => {
    try {
      // Get audio stream from user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        } 
      });
      streamRef.current = stream;
      
      // Start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        // Send audio for transcription
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          await transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (!hasUserImage && !isRecording) {
      alert("Please upload an image first to use voice input.");
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.transcription) {
        // Call the callback with the transcription
        onTranscriptionComplete(data.transcription);
      } else {
        console.error('Transcription error:', data.error);
        alert(`Transcription failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <button
      onClick={toggleRecording}
      disabled={isTranscribing || (!hasUserImage && !isRecording)}
      className={cn(
        "p-2 rounded-full transition-all",
        isRecording 
          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
          : hasUserImage 
            ? "bg-fuchsia-600 hover:bg-fuchsia-700"
            : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
      )}
      title="Voice Input"
    >
      {isTranscribing ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <Mic className="w-4 h-4 text-white" />
      )}
    </button>
  );
});

VoiceControl.displayName = "VoiceControl";

export default VoiceControl;
