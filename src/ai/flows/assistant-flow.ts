'use server';
/**
 * @fileOverview A voice assistant for app navigation and information.
 *
 * - processVoiceCommand - Transcribes audio and returns the text.
 * - textToSpeech - Converts text into speech.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

// Define schemas for voice command processing
const VoiceCommandInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A chunk of audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const VoiceCommandOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});

export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;


// Define the main flow for processing voice commands
const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async ({ audioDataUri }) => {
    // 1. Transcribe audio to text using Gemini
    const { text: transcription } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: [
        { text: 'Transcribe the following audio recording:' },
        { media: { url: audioDataUri } },
      ],
    });

    if (!transcription) {
      return { transcription: '' };
    }

    // 2. Intent recognition is now handled on the client.
    // This flow now only returns the transcription.
    return { transcription };
  }
);

export async function processVoiceCommand(input: VoiceCommandInput): Promise<VoiceCommandOutput> {
    return processVoiceCommandFlow(input);
}


// Define schemas for text-to-speech
const TextToSpeechInputSchema = z.string();
const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The synthesized audio as a data URI.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// Helper function to convert PCM buffer to WAV base64
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// Define the text-to-speech flow
const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Achernar' },
          },
        },
      },
      prompt: query,
    });

    if (!media?.url) {
      throw new Error('Text-to-speech generation failed.');
    }

    // Convert PCM to WAV for browser compatibility
    const pcmBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(pcmBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

export async function textToSpeech(input: string): Promise<TextToSpeechOutput> {
    return textToSpeechFlow(input);
}
