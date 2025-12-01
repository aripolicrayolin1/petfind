'use server';
/**
 * @fileOverview Flow for checking the reputation of potential adopters.
 *
 * - adoptionReputationCheck - Checks the reputation of potential adopters.
 * - AdoptionReputationCheckInput - The input type for the adoptionReputationCheck function.
 * - AdoptionReputationCheckOutput - The return type for the adoptionReputationCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdoptionReputationCheckInputSchema = z.object({
  applicantName: z.string().describe('El nombre completo del solicitante de adopción.'),
  applicantAddress: z.string().describe('La dirección del solicitante de adopción.'),
  applicantPhoneNumber: z.string().describe('El número de teléfono del solicitante de adopción.'),
  applicantEmail: z.string().email().describe('La dirección de correo electrónico del solicitante de adopción.'),
});
export type AdoptionReputationCheckInput = z.infer<typeof AdoptionReputationCheckInputSchema>;

const AdoptionReputationCheckOutputSchema = z.object({
  isApproved: z.boolean().describe('Si el solicitante está aprobado para la adopción.'),
  reason: z.string().describe('El motivo de la aprobación o el rechazo.'),
});
export type AdoptionReputationCheckOutput = z.infer<typeof AdoptionReputationCheckOutputSchema>;

export async function adoptionReputationCheck(input: AdoptionReputationCheckInput): Promise<AdoptionReputationCheckOutput> {
  return adoptionReputationCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adoptionReputationCheckPrompt',
  input: {schema: AdoptionReputationCheckInputSchema},
  output: {schema: AdoptionReputationCheckOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los administradores de refugios a determinar si un posible adoptante es adecuado para adoptar un animal.

  Con base en la información proporcionada, evalúa los antecedentes del solicitante y determina si es probable que proporcione un hogar seguro y afectuoso para el animal.

  Nombre del solicitante: {{{applicantName}}}
  Dirección del solicitante: {{{applicantAddress}}}
  Número de teléfono del solicitante: {{{applicantPhoneNumber}}}
  Correo electrónico del solicitante: {{{applicantEmail}}}

  Considera los siguientes factores:
  - Historial de abuso o negligencia animal
  - Antecedentes penales
  - Estabilidad financiera
  - Situación de vivienda
  - Referencias

  Proporciona una explicación clara y concisa para tu decisión.

  {{output}}
`,
});

const adoptionReputationCheckFlow = ai.defineFlow(
  {
    name: 'adoptionReputationCheckFlow',
    inputSchema: AdoptionReputationCheckInputSchema,
    outputSchema: AdoptionReputationCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
