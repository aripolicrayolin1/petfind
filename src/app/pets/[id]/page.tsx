'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Pet } from '@/types';
import AppLayout from '@/components/layout/app-layout';
import PetProfile from '@/components/pet-profile';
import { Skeleton } from '@/components/ui/skeleton';

export default function PetProfilePage() {
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      if (!params.id) {
        setLoading(false);
        setError('No pet ID provided.');
        return;
      }

      try {
        const petDocRef = doc(db, 'pets', params.id);
        const petDocSnap = await getDoc(petDocRef);

        if (petDocSnap.exists()) {
          setPet({ id: petDocSnap.id, ...petDocSnap.data() } as Pet);
        } else {
          setError('Pet not found.');
        }
      } catch (err) {
        console.error("Error fetching pet:", err);
        setError('Failed to fetch pet data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (error || !pet) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="bg-muted/30">
        <PetProfile pet={pet} />
      </div>
    </AppLayout>
  );
}
