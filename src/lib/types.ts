export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed: string;
  color: string;
  age: number | string;
  sex: 'Male' | 'Female';
  description?: string;
  status: 'Healthy' | 'Lost' | 'Adoptable' | 'Safe' | 'Adoption';
  ownerId: string | null;
  shelterId: string | null;
  imageUrl: string;
  imageHint: string;
  createdAt?: any;
  microchip?: string;
  medicalNotes?: string;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  phone: string;
  email: string;
  website?: string;
  hours: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    type: 'owner' | 'shelter';
    shelterId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
}
