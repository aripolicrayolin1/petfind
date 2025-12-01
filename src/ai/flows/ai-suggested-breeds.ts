'use server';

/**
 * @fileOverview Este archivo define un flujo de Genkit para sugerir razas de mascotas basadas en una imagen o descripción.
 *
 * El flujo toma una URI de datos de imagen o una descripción de la mascota como entrada y devuelve una lista de razas sugeridas.
 *
 * @interface AISuggestedBreedsInput - El tipo de entrada para la función aiSuggestedBreeds.
 * @interface AISuggestedBreedsOutput - El tipo de salida para la función aiSuggestedBreeds.
 *
 * @function aiSuggestedBreeds - La función principal que activa el flujo para sugerir razas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISuggestedBreedsInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "Una foto de la mascota, como una URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe('La descripción de las características de la mascota.'),
});

export type AISuggestedBreedsInput = z.infer<typeof AISuggestedBreedsInputSchema>;

const AISuggestedBreedsOutputSchema = z.object({
  suggestedBreeds: z
    .array(z.string())
    .describe('Una lista de razas sugeridas para la mascota.'),
});

export type AISuggestedBreedsOutput = z.infer<typeof AISuggestedBreedsOutputSchema>;

export async function aiSuggestedBreeds(
  input: AISuggestedBreedsInput
): Promise<AISuggestedBreedsOutput> {
  return aiSuggestedBreedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSuggestedBreedsPrompt',
  input: {schema: AISuggestedBreedsInputSchema},
  output: {schema: AISuggestedBreedsOutputSchema},
  prompt: `Eres un experto en razas de mascotas.

  Basado en la información proporcionada, sugiere una lista de posibles razas para la mascota.
  Si se proporciona una foto, analiza la foto para identificar características distintivas.
  Si se proporciona una descripción, utiliza la descripción para reducir las posibles razas.
  Devuelve una lista de las razas que son las coincidencias más probables.

  Foto: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No se proporcionó foto{{/if}}
  Descripción: {{#if description}}{{{description}}}{{else}}No se proporcionó descripción{{/if}}
  `,
});

const aiSuggestedBreedsFlow = ai.defineFlow(
  {
    name: 'aiSuggestedBreedsFlow',
    inputSchema: AISuggestedBreedsInputSchema,
    outputSchema: AISuggestedBreedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
