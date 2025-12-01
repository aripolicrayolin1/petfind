
export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  color: string;
  age: string;
  sex: 'Male' | 'Female';
  microchip?: string;
  medicalNotes?: string;
  status: 'Safe' | 'Lost' | 'Adoption';
  ownerId: string; 
  shelterId: string | null; 
  imageUrl: string;
  imageHint: string;
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
  hours: string;
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  imageUrl?: string;
  imageHint?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  avatarHint: string;
}

export interface Notification {
    id: string;
    ownerId: string; // The ID of the user or shelter who owns the notification
    petId?: string | null; 
    shelterId?: string | null; 
    message: string;
    createdAt: string; 
    read: boolean;
}

export interface AdoptionApplication {
    id: string;
    petId: string;
    petName: string;
    shelterId: string;
    applicantId: string; 
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    applicantAddress: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}
