
const admin = require('firebase-admin');

// Asegúrate de que la ruta al archivo de credenciales es correcta.
const serviceAccount = require('./petfind-f6d2d-firebase-adminsdk-fbsvc-b7eedf56cc.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: '/placeholder.svg',
  avatarHint: 'A person'
};

// DATOS CORREGIDOS
const mockPets = [
  {
    id: '1',
    name: 'Buddy',
    ownerId: '1',
    shelterId: '1',
    species: 'Dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    age: 2,
    sex: 'Male',
    description: 'A friendly and energetic dog.',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MHx8fHwxNzU5NzMxNjQwfDA&ixlib.rb-4.0.3&q=80&w=800',
    imageHint: 'A friendly golden retriever',
    status: 'Adoptable',
    microchip: '123456789',
    medicalNotes: 'Loves to play fetch.',
  },
  {
    id: '2',
    name: 'Lucy',
    ownerId: '1',
    shelterId: '1',
    species: 'Cat',
    breed: 'Siamese',
    color: 'White',
    age: 1,
    sex: 'Female',
    description: 'A very vocal and affectionate cat.',
    imageUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzaWFtZXNlJTIwY2F0fGVufDB8fHx8MTc1OTczMTY1MHww&ixlib.rb-4.0.3&q=80&w=800',
    imageHint: 'An elegant siamese cat',
    status: 'Adoptable',
    microchip: '987654321',
    medicalNotes: 'Enjoys napping in the sun.',
  },
];

const seedDatabase = async () => {
  try {
    console.log('Subiendo usuario...');
    await db.collection('users').doc(mockUser.id).set(mockUser);
    console.log(`  - ${mockUser.name} subido correctamente.`);

    console.log('Subiendo mascotas...');
    for (const pet of mockPets) {
      await db.collection('pets').doc(pet.id).set(pet);
      console.log(`  - ${pet.name} subido correctamente.`);
    }

    console.log('\n¡La base de datos ha sido poblada exitosamente!');

  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
  } finally {
    await app.delete();
  }
};

seedDatabase();
