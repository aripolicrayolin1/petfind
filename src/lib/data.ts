import { Pet, User } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: '/placeholder.svg',
  avatarHint: 'A person'
};

export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    ownerId: '1',
    shelterId: null,
    species: 'Dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    age: 2,
    sex: 'Male',
    status: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MHx8fHwxNzU5NzMxNjQwfDA&ixlib.rb-4.0.3&q=80&w=800',
    imageHint: 'A friendly golden retriever'
  },
  {
    id: '2',
    name: 'Lucy',
    ownerId: '1',
    shelterId: null,
    species: 'Cat',
    breed: 'Siamese',
    color: 'White',
    age: 5,
    sex: 'Female',
    status: 'Healthy',
    imageUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzaWFtZXNlJTIwY2F0fGVufDB8fHx8MTc1OTczMTY1MHww&ixlib.rb-4.0.3&q=80&w=800',
    imageHint: 'An elegant siamese cat'
  }
];
