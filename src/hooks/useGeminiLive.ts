import { useState, useRef, useEffect, useCallback } from 'react';
import { HostPersonality } from '../types';
import { float32ToPcmBase64, PcmStreamPlayer } from '../utils/audioUtils';

export interface UseGeminiLiveOptions {
  host: HostPersonality;
  gameContext?: string;
  onTranscription?: (text: string, role: 'user' | 'model') => void;
}

export function useGeminiLive({ host, gameContext = '', onTranscription }: UseGeminiLiveOptions) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHostSpeaking, setIsHostSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);

  const [isMicAvailable, setIsMicAvailable] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playerRef = useRef<PcmStreamPlayer | null>(null);
  const isMicMutedRef = useRef(isMicMuted);
  const hostRef = useRef(host);
  const gameContextRef = useRef(gameContext);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    hostRef.current = host;
  }, [host]);

  useEffect(() => {
    gameContextRef.current = gameContext;
  }, [gameContext]);

  // Connect to Gemini Live API via WebSocket
  const startLiveSession = useCallback(async () => {
    if (status === 'connected' || status === 'connecting') return;
    setStatus('connecting');
    setErrorMessage(null);

    // 1. Attempt microphone stream (graceful fallback if blocked or denied)
    let stream: MediaStream | null = null;
    let micGranted = false;

    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
          },
        });
        mediaStreamRef.current = stream;
        micGranted = true;
        setIsMicAvailable(true);
      } catch (micErr: any) {
        console.warn('Microphone permission not granted or unavailable, starting Live Session in text/audio-out mode:', micErr);
        setIsMicAvailable(false);
        if (micErr.name === 'NotAllowedError' || micErr.message?.includes('Permission denied')) {
          setErrorMessage('Microphone permission blocked. You can still chat with the host by typing below!');
        }
      }
    } else {
      setIsMicAvailable(false);
      setErrorMessage('Microphone not supported in this browser. You can still chat by typing below!');
    }

    try {
      // 2. Setup 16kHz input AudioContext if mic is active
      if (micGranted && stream) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioCtx({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        if (inputCtx.state === 'suspended') {
          await inputCtx.resume();
        }
      }

      // 3. Setup output PCM stream player for 24kHz audio from Gemini Live
      const player = new PcmStreamPlayer(24000);
      player.onStateChange = (speaking) => {
        setIsHostSpeaking(speaking);
      };
      playerRef.current = player;

      // 4. Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial setup payload with host personality and game state
        ws.send(
          JSON.stringify({
            type: 'init',
            hostPrompt: hostRef.current.systemPrompt,
            voiceName: hostRef.current.voiceName,
            gameContext: gameContextRef.current,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setStatus('connected');
          } else if (msg.type === 'audio' && msg.audio) {
            playerRef.current?.playChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            playerRef.current?.stop();
            setIsHostSpeaking(false);
          } else if (msg.type === 'transcription' && msg.text) {
            onTranscription?.(msg.text, msg.role || 'model');
          } else if (msg.type === 'error') {
            setErrorMessage(msg.error || 'Live API error');
            setStatus('error');
          }
        } catch (e) {
          console.error('Error handling live message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('Failed to connect to live audio host. You can retry anytime.');
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'connected' ? 'idle' : prev));
      };

      // 5. Connect microphone processor if microphone stream was granted
      if (micGranted && stream && inputAudioCtxRef.current) {
        const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
        const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMicMutedRef.current || ws.readyState !== WebSocket.OPEN) return;

          const inputData = e.inputBuffer.getChannelData(0);

          // Calculate simple RMS volume level for UI mic visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setUserAudioLevel(Math.min(1, rms * 5));

          // Send 16-bit PCM chunk to Live API
          const base64Audio = float32ToPcmBase64(inputData);
          ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputAudioCtxRef.current.destination);
      }
    } catch (err: any) {
      console.error('Error starting live session:', err);
      setErrorMessage(err.message || 'Error connecting to Live API');
      setStatus('error');
      cleanup();
    }
  }, [status, onTranscription]);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setStatus('idle');
    setIsHostSpeaking(false);
    setUserAudioLevel(0);
  }, []);

  const stopLiveSession = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const sendGameContextUpdate = useCallback((newContext: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: `[GAME UPDATE]: ${newContext}`,
        })
      );
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    errorMessage,
    isHostSpeaking,
    isMicMuted,
    isMicAvailable,
    userAudioLevel,
    startLiveSession,
    stopLiveSession,
    toggleMute,
    sendGameContextUpdate,
  };
}
