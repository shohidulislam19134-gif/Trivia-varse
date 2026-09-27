import { useState, useRef, useCallback, useEffect } from 'react';
import { HostPersonality } from '../types';
import { pcmToWavBlob } from '../utils/audioUtils';

export function useHostTts(host: HostPersonality) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map()); // text -> blobUrl

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, customStyle?: string) => {
      if (!text || text.trim() === '') return;
      stop();
      setIsLoading(true);
      setError(null);

      const cacheKey = `${host.voiceName}:${host.speechStyle}:${text}`;

      try {
        let blobUrl = cacheRef.current.get(cacheKey);

        if (!blobUrl) {
          const res = await fetch('/api/trivia/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceName: host.voiceName,
              speechStyle: customStyle || host.speechStyle,
              speaker: host.name,
            }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `TTS request failed with status ${res.status}`);
          }

          const data = await res.json();
          if (data.fallback || !data.audio) {
            // Trigger speech synthesis fallback smoothly
            throw new Error(data.error || 'TTS audio fallback requested');
          }

          // Convert raw 24kHz PCM to playable WAV blob
          const wavBlob = pcmToWavBlob(data.audio, data.sampleRate || 24000);
          blobUrl = URL.createObjectURL(wavBlob);
          cacheRef.current.set(cacheKey, blobUrl);
        }

        if (currentBlobUrlRef.current && currentBlobUrlRef.current !== blobUrl) {
          // Keep old cached blobs around, just update current
        }
        currentBlobUrlRef.current = blobUrl;

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.src = blobUrl;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsSpeaking(false);
          setIsLoading(false);
        };

        await audio.play();
        setIsLoading(false);
      } catch (err: any) {
        console.warn('Gemini 3.8 Flash TTS error, trying browser speech synthesis fallback:', err);
        setError(err.message || 'TTS playback failed');

        // Graceful fallback to browser speech synthesis so speech never abruptly fails for the user
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
              setIsSpeaking(false);
              setIsLoading(false);
            };
            utterance.onerror = () => {
              setIsSpeaking(false);
              setIsLoading(false);
            };
            window.speechSynthesis.speak(utterance);
            return;
          } catch (synthErr) {
            // ignore
          }
        }

        setIsSpeaking(false);
        setIsLoading(false);
      }
    },
    [host, stop]
  );

  useEffect(() => {
    return () => {
      stop();
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
  };
}
