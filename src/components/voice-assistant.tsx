'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Cat, Loader2, PawPrint } from 'lucide-react';
import {
  processVoiceCommand,
  textToSpeech,
} from '@/ai/flows/assistant-flow';
import useSound from 'use-sound';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking';

const WELCOME_MESSAGE =
  '¡Hola! Soy tu asistente de PetLink. Puedo ayudarte a navegar la aplicación. Por ejemplo, puedes decir "llévame a la página de adopción" o "necesito registrar a mi mascota". ¿Cómo puedo ayudarte?';

type NavigationAction =
  | '/'
  | '/adopt'
  | '/shelters'
  | '/pets/new'
  | '/login'
  | 'unknown';

// Client-side intent recognition
const getActionFromTranscription = (text: string): NavigationAction => {
  const lowerCaseText = text.toLowerCase();
  if (
    lowerCaseText.includes('adoptar') ||
    lowerCaseText.includes('perro') ||
    lowerCaseText.includes('gato')
  ) {
    return '/adopt';
  }
  if (lowerCaseText.includes('refugio')) {
    return '/shelters';
  }
  if (lowerCaseText.includes('registrar') || lowerCaseText.includes('nueva mascota')) {
    return '/pets/new';
  }
  if (
    lowerCaseText.includes('iniciar sesión') ||
    lowerCaseText.includes('login')
  ) {
    return '/login';
  }
  if (lowerCaseText.includes('inicio') || lowerCaseText.includes('home')) {
    return '/';
  }
  return 'unknown';
};

export function VoiceAssistant() {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [transcription, setTranscription] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const [playWelcome, { stop: stopWelcomeSound }] = useSound(
    '/sounds/welcome.mp3',
    {
      onplay: () => setStatus('speaking'),
      onend: () => setStatus('idle'),
      onerror: () => setStatus('idle'),
    }
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      mediaRecorderRef.current.start();
      setTranscription('');
      setStatus('listening');
    } catch (err) {
      console.error('Error starting recording:', err);
      // Handle permissions error
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        processRecording(audioBlob);
        audioChunksRef.current = [];
        // Stop all media tracks to turn off the mic indicator
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      });
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  };

  const handleMicClick = () => {
    if (status === 'listening') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleWelcomeClick = () => {
    if (status === 'speaking') {
      stopWelcomeSound();
      setStatus('idle');
    } else {
      playWelcome();
    }
  };

  const processRecording = async (mediaBlob: Blob) => {
    if (!mediaBlob) return;

    setStatus('processing');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(mediaBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Step 1: Transcribe audio to text
        const { transcription } = await processVoiceCommand({
          audioDataUri: base64Audio,
        });

        setTranscription(transcription);

        // Step 2: Get action from transcription on the client
        const action = getActionFromTranscription(transcription);

        if (action && action !== 'unknown') {
          const { audioDataUri } = await textToSpeech(
            `Entendido, llevándote a la página correcta.`
          );
          if (audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
            audioRef.current.onended = () => {
              router.push(action);
              setStatus('idle');
            };
          } else {
            router.push(action);
            setStatus('idle');
          }
        } else {
          const { audioDataUri } = await textToSpeech(
            'No estoy seguro de entender. ¿Podrías intentarlo de nuevo?'
          );
          if (audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
            audioRef.current.onended = () => setStatus('idle');
          } else {
            setStatus('idle');
          }
        }
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      // We check for the specific 404 error here and give a user-friendly message.
      if (error instanceof Error && error.message.includes('404')) {
        const { audioDataUri } = await textToSpeech(
          'El servicio de voz no está disponible en este momento. Por favor, inténtalo más tarde.'
        );
        if (audioRef.current) {
          audioRef.current.src = audioDataUri;
          audioRef.current.play();
          audioRef.current.onended = () => setStatus('idle');
        } else {
          setStatus('idle');
        }
      } else {
        const { audioDataUri } = await textToSpeech(
          'Hubo un error. Por favor, inténtalo de nuevo.'
        );
        if (audioRef.current) {
          audioRef.current.src = audioDataUri;
          audioRef.current.play();
          audioRef.current.onended = () => setStatus('idle');
        } else {
          setStatus('idle');
        }
      }
    }
  };

  // Generate welcome message TTS on mount
  useEffect(() => {
    setIsMounted(true);
    const generateWelcomeAudio = async () => {
      try {
        // Check if the sound file already exists to avoid re-generating
        const response = await fetch('/sounds/welcome.mp3');
        if (response.ok) {
          return;
        }
        const { audioDataUri } = await textToSpeech(WELCOME_MESSAGE);
        // This is a trick to "download" the file to the public folder
        // so `useSound` can access it. It relies on serverless function behavior.
        // In a real scenario, you'd save this to a bucket.
        await fetch('/api/save-sound', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioDataUri, fileName: 'welcome.mp3' }),
        });
      } catch (error) {
        console.error('Failed to generate welcome audio:', error);
      }
    };
    generateWelcomeAudio();
  }, []);

  if (!isMounted) return null;

  const getButtonIcon = () => {
    switch (status) {
      case 'listening':
        return <PawPrint className="h-8 w-8 text-red-500 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin" />;
      default:
        return <PawPrint className="h-8 w-8" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        <audio ref={audioRef} className="hidden" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleWelcomeClick}
              size="icon"
              className="bg-accent text-accent-foreground rounded-full h-14 w-14 shadow-lg hover:bg-accent/90"
              aria-label="Escuchar introducción del asistente de voz"
            >
              <Cat className="h-7 w-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Escucha la introducción</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleMicClick}
              size="icon"
              className={cn(
                'rounded-full h-16 w-16 shadow-lg flex items-center justify-center',
                status === 'listening' ? 'bg-red-500/20' : 'bg-primary'
              )}
              disabled={status === 'processing' || status === 'speaking'}
              aria-label={status === 'listening' ? 'Dejar de escuchar' : 'Activar asistente de voz'}
            >
              {getButtonIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>
              {status === 'listening'
                ? 'Pulsa para dejar de escuchar'
                : 'Pulsa para hablar'}
            </p>
          </TooltipContent>
        </Tooltip>
        {status === 'listening' && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Escuchando...
          </p>
        )}
        {transcription && status !== 'listening' && (
          <p className="text-sm text-muted-foreground italic">
            "{transcription}"
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
