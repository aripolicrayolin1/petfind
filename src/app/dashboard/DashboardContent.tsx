'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PetCard from '@/components/pet-card';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Pet } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext'; // <-- CONECTADO AL CEREBRO

export default function DashboardContent() {
  const { currentUser, loading } = useAuth(); // <-- Obteniendo datos del cerebro
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      if (currentUser) {
        try {
          const petsQuery = query(collection(db, 'pets'), where('ownerId', '==', currentUser.id));
          const petsSnapshot = await getDocs(petsQuery);
          const pets = petsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Pet);
          setUserPets(pets);
        } catch (error) {
          console.error("Error fetching user pets:", error);
          setUserPets([]);
        } finally {
          setPetsLoading(false);
        }
      }
    };

    if (!loading) { // Solo busca mascotas cuando la autenticación haya terminado
        fetchPets();
    }

  }, [currentUser, loading]); // Depende del usuario y el estado de carga del cerebro

  if (loading) {
    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                Cargando tu información...
            </h1>
            <p className="mt-1 text-muted-foreground">
                Estamos preparando tu panel de control.
            </p>
        </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                Acceso denegado
            </h1>
            <p className="mt-1 text-muted-foreground">
                Por favor, inicia sesión para ver tu panel de control.
            </p>
            <Button asChild className="mt-4">
                <Link href="/login">Iniciar Sesión</Link>
            </Button>
        </div>
    );
  }
  
  return (
    <>
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
              ¡Bienvenido de vuelta, {currentUser?.name || 'Usuario'}!
            </h1>
            <p className="mt-1 text-muted-foreground">
              Aquí están tus compañeros registrados.
            </p>
          </div>
          <Button asChild>
            <Link href="/pets/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar nueva mascota
            </Link>
          </Button>
        </div>
        {(petsLoading || loading) ? (
          <div className="text-center py-16">
            <p>Cargando mascotas...</p>
          </div>
        ) : userPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-foreground">
              Aún no tienes mascotas registradas
            </h3>
            <p className="mt-2 text-muted-foreground">
              ¡Empieza añadiendo a tu primer compañero!
            </p>
            <Button className="mt-6" asChild>
              <Link href="/pets/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar una mascota
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
