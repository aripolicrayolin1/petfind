'use server';

/**
 * @fileOverview Este archivo define un flujo de Genkit para generar una descripción atractiva y detallada para una mascota.
 *
 * El flujo toma palabras clave y rasgos como entrada y devuelve una descripción de mascota generada.
 * @interface GeneratePetDescriptionInput - Representa el esquema de entrada para el flujo generatePetDescription.
 * @interface GeneratePetDescriptionOutput - Representa el esquema de salida para el flujo generatePetDescription.
 * @function generatePetDescription - Una función que utiliza el flujo para generar una descripción de mascota.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePetDescriptionInputSchema = z.object({
  name: z.string().describe('El nombre de la mascota.'),
  species: z.string().describe('La especie de la mascota (p. ej., perro, gato, pájaro).'),
  breed: z.string().describe('La raza de la mascota (p. ej., Labrador, Siamés).'),
  color: z.string().describe('El color de la mascota.'),
  age: z.string().describe('La edad de la mascota.'),
  sex: z.string().describe('El sexo de la mascota (macho o hembra).'),
  traits: z.string().describe('Una lista de rasgos o características de la mascota separados por comas (p. ej., juguetón, amigable, enérgico).'),
});
export type GeneratePetDescriptionInput = z.infer<typeof GeneratePetDescriptionInputSchema>;

const GeneratePetDescriptionOutputSchema = z.object({
  description: z.string().describe('Una descripción atractiva y detallada de la mascota.'),
});
export type GeneratePetDescriptionOutput = z.infer<typeof GeneratePetDescriptionOutputSchema>;

export async function generatePetDescription(input: GeneratePetDescriptionInput): Promise<GeneratePetDescriptionOutput> {
  return generatePetDescriptionFlow(input);
}

const generatePetDescriptionPrompt = ai.definePrompt({
  name: 'generatePetDescriptionPrompt',
  input: {schema: GeneratePetDescriptionInputSchema},
  output: {schema: GeneratePetDescriptionOutputSchema},
  prompt: `Escribe una descripción atractiva y detallada para una mascota llamada {{name}} que es un(a) {{species}} {{breed}} de color {{color}}, {{sex}} de {{age}}.
Los rasgos de la mascota son: {{traits}}.
La descripción debe ser adecuada para su uso en un perfil de adopción o en un cartel de mascota perdida.
Concéntrate en hacer que la mascota suene atractiva y única.`,
});

const generatePetDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePetDescriptionFlow',
    inputSchema: GeneratePetDescriptionInputSchema,
    outputSchema: GeneratePetDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generatePetDescriptionPrompt(input);
    return output!;
  }
);
