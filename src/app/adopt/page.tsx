'use client';

import PetCard from '@/components/pet-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Pet } from '@/types';
import { db } from '@/lib/firebase'; // Import the db instance
import { collection, getDocs } from 'firebase/firestore'; // Import firestore functions

export default function AdoptPage() {
  const [allPets, setAllPets] = useState<Pet[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      const petsCollection = collection(db, 'pets');
      const petsSnapshot = await getDocs(petsCollection);
      const petsList = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pet[];
      setAllPets(petsList);
    };

    fetchPets();
  }, []);

  const adoptionPets = allPets.filter((pet) => pet.status === 'Adoption');

  return (
    <>
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-headline sm:text-5xl">
            Encuentra a tu nuevo mejor amigo
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explora nuestra lista de adorables mascotas que esperan un hogar para siempre.
          </p>
        </div>

        <Card className="p-4 sm:p-6 mb-8 bg-muted/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input placeholder="Buscar por raza o nombre..." className="lg:col-span-2 bg-background" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Perro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar mascotas
            </Button>
          </div>
        </Card>

        {adoptionPets.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adoptionPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-foreground">
              No hay mascotas para adoptar
            </h3>
            <p className="mt-2 text-muted-foreground">
              Aún no hay datos en Firestore. ¡Agrega algunos para empezar!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
