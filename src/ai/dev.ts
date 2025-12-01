import { config } from 'dotenv';
config();

import '@/ai/flows/generate-pet-description.ts';
import '@/ai/flows/adoption-reputation-check.ts';
import '@/ai/flows/ai-suggested-breeds.ts';
import '@/ai/flows/assistant-flow.ts';
