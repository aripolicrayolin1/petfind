'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Pet } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, Phone, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext'; // Importar el hook de autenticación

export default function PrintPosterPage() {
  const params = useParams<{ id: string }>();
  const { currentUser } = useAuth(); // Obtener el usuario actual
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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
          const petData = { id: petDocSnap.id, ...petDocSnap.data() } as Pet;
          setPet(petData);
          const petProfileUrl = `${window.location.origin}/pets/${petData.id}`;
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(petProfileUrl)}`);
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
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
    );
  }

  if (error || !pet) {
    return notFound();
  }

  const handlePrint = () => {
    window.print();
  };

  // Asumimos que el número de teléfono está en el perfil del usuario
  const userPhoneNumber = currentUser?.phone || '[Tu número de teléfono]';

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
              src={pet.imageUrl} // Usamos la imagen de la mascota
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
            <p><strong className="font-bold">Señas particulares:</strong> {pet.medicalNotes || 'Ninguna'}</p>
          </div>
        </div>
        <div className="mt-8 text-center bg-yellow-400 p-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-black">¡SE OFRECE RECOMPENSA!</h3>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-8 border-t-8 border-yellow-400 pt-8">
            <div className="text-center">
                <h4 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-2">
                    <Phone className="h-8 w-8"/> Contacto:
                </h4>
                <p className="text-3xl sm:text-4xl font-mono mt-2">{userPhoneNumber}</p>
            </div>
             <div className="text-center">
                <p className="font-bold mb-2">Escanea para ver mi perfil completo</p>
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
