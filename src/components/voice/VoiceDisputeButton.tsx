import React, { useEffect, useState, useRef } from 'react';
import { MicIcon, SquareIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
interface VoiceDisputeButtonProps {
  onTranscript: (text: string) => void;
}
export function VoiceDisputeButton({ onTranscript }: VoiceDisputeButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast.error('Voice recognition failed. Please try again.');
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
      }
    }
  }, []);
  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      toast.info('Listening... Speak your dispute reason.');
    }
  };
  const handleUseText = () => {
    if (transcript) {
      onTranscript(transcript);
      setTranscript('');
      setIsListening(false);
      recognitionRef.current?.stop();
    }
  };
  if (!isSupported) return null;
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative">
        {isListening &&
        <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping scale-150"></div>
        }
        <Button
          variant={isListening ? 'danger' : 'secondary'}
          size="md"
          className="relative z-10 rounded-full w-12 h-12 p-0 flex items-center justify-center"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}>
          
          {isListening ?
          <SquareIcon className="w-5 h-5" /> :

          <MicIcon className="w-5 h-5" />
          }
        </Button>
      </div>

      {isListening &&
      <div className="mt-4 w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 italic min-h-[40px]">
            {transcript || 'Listening...'}
          </p>
          {transcript &&
        <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={handleUseText}>
                Use This Text
              </Button>
            </div>
        }
        </div>
      }
    </div>);

}