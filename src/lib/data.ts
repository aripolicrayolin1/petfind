import type { User, Pet, Shelter } from '@/types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find((p) => p.id === id);
  return {
    url: img?.imageUrl || `https://picsum.photos/seed/${id}/800/600`,
    hint: img?.imageHint || 'image',
  };
};

export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: getImage('user-avatar-1').url,
  avatarHint: getImage('user-avatar-1').hint,
};

export const mockPets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    color: 'Dorado',
    age: '2 años',
    sex: 'Male',
    microchip: '985112009876543',
    medicalNotes: 'Al día con todas las vacunas. Alérgico a las aves de corral.',
    status: 'Safe',
    ownerId: 'user-1',
    shelterId: null,
    imageUrl: getImage('pet-1').url,
    imageHint: getImage('pet-1').hint,
  },
  {
    id: 'pet-2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamés',
    color: 'Crema',
    age: '5 años',
    sex: 'Female',
    status: 'Lost',
    ownerId: 'user-1',
    shelterId: null,
    imageUrl: getImage('pet-2').url,
    imageHint: getImage('pet-2').hint,
  },
  {
    id: 'pet-3',
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador',
    color: 'Negro',
    age: '3 años',
    sex: 'Male',
    status: 'Adoption',
    ownerId: 'shelter-1', // This pet belongs to a shelter
    shelterId: 'shelter-1',
    imageUrl: getImage('pet-3').url,
    imageHint: getImage('pet-3').hint,
  },
  {
    id: 'pet-4',
    name: 'Misty',
    species: 'Cat',
    breed: 'Doméstico de pelo corto',
    color: 'Gris',
    age: '1 año',
    sex: 'Female',
    status: 'Adoption',
    ownerId: 'shelter-2', // This pet belongs to a shelter
    shelterId: 'shelter-2',
    imageUrl: getImage('pet-4').url,
    imageHint: getImage('pet-4').hint,
  },
    {
    id: 'pet-5',
    name: 'Charlie',
    species: 'Dog',
    breed: 'Poodle',
    color: 'Marrón',
    age: '4 años',
    sex: 'Male',
    status: 'Safe',
    ownerId: 'user-1',
    shelterId: null,
    imageUrl: getImage('pet-5').url,
    imageHint: getImage('pet-5').hint,
  },
];

export const mockShelters: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Amigos Peludos CDMX',
    address: 'Av. Insurgentes Sur 456, Roma Nte., 06700 Ciudad de México, CDMX',
    lat: 19.4172,
    lng: -99.1623,
    city: 'Ciudad de México',
    state: 'CDMX',
    phone: '55 1234 5678',
    email: 'contacto@amigospeludos.mx',
    hours: '10am - 6pm',
    status: 'approved',
    ownerId: 'user-shelter-1', // A dedicated owner ID for the shelter
    imageUrl: getImage('shelter-1').url,
    imageHint: getImage('shelter-1').hint,
  },
  {
    id: 'shelter-2',
    name: 'Refugio San Francisco GDL',
    address: 'Av. Vallarta 1234, Americana, 44160 Guadalajara, Jal.',
    lat: 20.6766,
    lng: -103.3615,
    city: 'Guadalajara',
    state: 'Jalisco',
    phone: '33 9876 5432',
    email: 'info@refugiosfg.org',
    hours: '11am - 5pm',
    status: 'approved',
    ownerId: 'user-shelter-2', // A dedicated owner ID for the shelter
    imageUrl: getImage('shelter-2').url,
    imageHint: getImage('shelter-2').hint,
  },
];
