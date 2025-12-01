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
import { Search, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Pet } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdoptPage() {
  const [adoptionPets, setAdoptionPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdoptionPets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Creamos una consulta a Firestore para obtener solo las mascotas en adopción
        const petsCollection = collection(db, 'pets');
        const q = query(petsCollection, where("status", "==", "Adoption"));
        
        const petsSnapshot = await getDocs(q);
        const petsList = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Pet[];
        setAdoptionPets(petsList);

      } catch (err) {
        console.error("Error fetching adoption pets:", err);
        setError("No se pudieron cargar las mascotas. Por favor, inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptionPets();
  }, []);

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[250px] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-destructive/10 border-destructive/50">
                <h3 className="text-xl font-medium text-destructive-foreground">Error al cargar</h3>
                <p className="mt-2 text-muted-foreground">{error}</p>
            </div>
        ) : adoptionPets.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adoptionPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-foreground">
              No hay mascotas en adopción por el momento
            </h3>
            <p className="mt-2 text-muted-foreground">
              Vuelve a consultar más tarde, ¡constantemente se suman nuevos amigos!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
