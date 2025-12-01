'use client';

import { mockPets } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Printer, Phone, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Pet } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrintPosterPage() {
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (params.id) {
      const storedPetsRaw = localStorage.getItem('userPets');
      const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
      const foundPet = allPets.find((p) => p.id === params.id);
      
      if (foundPet) {
        setPet(foundPet);
        const petProfileUrl = `${window.location.origin}/pets/${foundPet.id}`;
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(petProfileUrl)}`);
      } else {
        setPet(null);
      }
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    );
  }

  if (!pet) {
    return notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto no-print mb-4 flex justify-end">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir cartel
        </Button>
      </div>

      <div id="print-section" className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
        <div className="text-center border-b-8 border-yellow-400 pb-4">
          <h1 className="text-6xl sm:text-8xl font-extrabold text-red-600 tracking-tighter">MASCOTA PERDIDA</h1>
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-800">{pet.name}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <div className="relative aspect-square w-full border-4 border-black">
            <Image
              src={pet.imageUrl}
              alt={`Foto de ${pet.name}`}
              fill
              className="object-cover"
              data-ai-hint={pet.imageHint}
              priority
            />
          </div>
          <div className="flex flex-col justify-center space-y-4 text-xl">
            <p><strong className="font-bold">Raza:</strong> {pet.breed}</p>
            <p><strong className="font-bold">Color:</strong> {pet.color}</p>
            <p><strong className="font-bold">Edad:</strong> {pet.age}</p>
            <p><strong className="font-bold">Sexo:</strong> {pet.sex}</p>
            <p><strong className="font-bold">Última vez visto:</strong> [Ingresa la ubicación aquí]</p>
            {pet.medicalNotes && <p><strong className="font-bold">Notas:</strong> {pet.medicalNotes}</p>}
          </div>
        </div>
        <div className="mt-8 text-center bg-yellow-400 p-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-black">¡RECOMPENSA!</h3>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-8 border-t-8 border-yellow-400 pt-8">
            <div className="text-center">
                <h4 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-2">
                    <Phone className="h-8 w-8"/> Llama o envía un mensaje:
                </h4>
                <p className="text-3xl sm:text-4xl font-mono mt-2">(555) 123-4567</p>
            </div>
             <div className="text-center">
                <p className="font-bold mb-2">Escanea para ver mi perfil</p>
                {qrCodeUrl ? (
                    <Image
                        src={qrCodeUrl}
                        alt="Código QR de la mascota"
                        width={150}
                        height={150}
                        className="mx-auto"
                        data-ai-hint="qr code"
                    />
                ) : (
                    <Skeleton className="h-[150px] w-[150px] mx-auto" />
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
