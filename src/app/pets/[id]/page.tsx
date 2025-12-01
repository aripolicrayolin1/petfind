'use client';

import { useEffect, useState } from 'react';
import PetProfile from "@/components/pet-profile";
import { mockPets } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import { Pet } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PetProfilePage() {
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const storedPetsRaw = localStorage.getItem('userPets');
      const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
      const foundPet = allPets.find((p) => p.id === params.id);
      
      if (foundPet) {
        setPet(foundPet);
      } else {
        // If not found, it might be one of the original mock pets not in localStorage yet
        const mockPet = mockPets.find(p => p.id === params.id);
        if (mockPet) {
          setPet(mockPet);
        } else {
          setPet(null); // Will trigger notFound()
        }
      }
      setLoading(false);
    }
  }, [params.id]);
  
  if (loading) {
    return (
        <div className="container max-w-5xl mx-auto py-8 sm:py-12 space-y-8">
            <Skeleton className="h-12 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="w-full aspect-[4/3]" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    )
  }

  if (!pet) {
    notFound();
  }

  return (
    <div className="bg-muted/30">
        <PetProfile pet={pet} />
    </div>
  );
}
