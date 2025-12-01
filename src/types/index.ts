import { z } from 'zod';
import type { User as FirebaseAuthUser } from 'firebase/auth';

// Esquema de Zod para la validación del formulario de mascotas.
export const petFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  species: z.enum(['Dog', 'Cat', 'Other'], { message: 'Especie no válida.' }),
  breed: z.string().min(2, { message: 'La raza es obligatoria.' }),
  color: z.string().min(3, { message: 'El color es obligatorio.' }),
  age: z.string().min(1, { message: 'La edad es obligatoria.' }),
  sex: z.enum(['Male', 'Female'], { message: 'Sexo no válido.' }),
  microchip: z.string().optional(),
  medicalNotes: z.string().optional(),
});

// Tipo para el estado de la mascota, asegura que solo se usen valores válidos.
export type PetStatus = 'Safe' | 'Adoption' | 'Lost';

// Tipo principal de la mascota, combinando el esquema de Zod con campos adicionales.
export interface Pet extends z.infer<typeof petFormSchema> {
  id: string;
  ownerId: string;
  shelterId: string | null;
  status: PetStatus;
  imageUrl: string;
  imageHint: string;
  createdAt?: string;
}

// **TIPO DE USUARIO CORREGIDO Y FINAL**
// Representa el objeto de usuario enriquecido que se usa en toda la aplicación.
export interface User {
  id: string; // Coincide con el UID de Firebase Auth
  name: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
  phone: string; // Se cambia a no opcional para consistencia.
  pets: string[];
  createdAt: string;
  // Objeto de autenticación de Firebase en vivo, para operaciones de perfil.
  auth: FirebaseAuthUser | null;
}

// Esquema y tipo para el formulario de contacto de adopción.
export const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("El correo no es válido"),
  message: z.string().min(10, "El mensaje es muy corto"),
  petName: z.string(),
  petId: z.string(),
  ownerId: z.string(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Esquema y tipo para la solicitud de registro de un refugio.
export const shelterApplicationSchema = z.object({
  shelterName: z.string().min(3, 'El nombre del refugio es muy corto'),
  email: z.string().email('El correo electrónico no es válido'),
  phone: z.string().min(8, 'El número de teléfono no es válido'),
  address: z.string().min(10, 'La dirección es muy corta'),
  website: z.string().url('La URL del sitio web no es válida').optional().or(z.literal('')),
  story: z.string().min(20, 'Tu historia es muy corta, ¡cuéntanos más!'),
});
export type ShelterApplicationValues = z.infer<typeof shelterApplicationSchema>;

// **TIPO DE REFUGIO CORREGIDO Y FINAL**
// El tipo de dato para el Refugio, que se usa en toda la aplicación.
export interface Shelter extends ShelterApplicationValues {
  id: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl: string;
  imageHint: string;
  createdAt: string;
  lat?: number;
  lng?: number;
}

// **TIPO DE NOTIFICACIÓN AÑADIDO**
export interface Notification {
  id: string;
  ownerId: string; // ID del usuario que recibe la notificación
  message: string;
  read: boolean;
  createdAt: string;
  shelterId?: string; // Opcional, si está relacionado con un refugio
  petId?: string;     // Opcional, si está relacionado con una mascota
}
