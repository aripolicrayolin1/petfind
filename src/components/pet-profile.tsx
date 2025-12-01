'use client';

import { useState, useEffect } from 'react';
import type { Pet } from '@/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Cat,
  Dog,
  Heart,
  Home,
  Microwave,
  Printer,
  QrCode,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { AdoptionDialog } from './adoption-dialog';
import { mockPets } from '@/lib/data';

interface PetProfileProps {
  pet: Pet;
}

export default function PetProfile({ pet: initialPet }: PetProfileProps) {
  const [pet, setPet] = useState(initialPet);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // We need to re-read from localStorage in case the initialPet prop is stale
    const storedPetsRaw = localStorage.getItem('userPets');
    const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
    const currentPetData = allPets.find(p => p.id === initialPet.id);
    if (currentPetData) {
      setPet(currentPetData);
    }
    
    if (typeof window !== 'undefined') {
      const petProfileUrl = `${window.location.origin}/pets/${pet.id}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(petProfileUrl)}`);
    }
  }, [pet.id, initialPet.id]);

  const statusTranslations: Record<Pet['status'], string> = {
    Lost: 'Perdido',
    Adoption: 'En adopción',
    Safe: 'A salvo',
  };

  const handleStatusChange = (isLost: boolean) => {
    const newStatus = isLost ? 'Lost' : 'Safe';
    
    // Update local component state for immediate UI feedback
    setPet({ ...pet, status: newStatus });

    // Update the pet in localStorage for persistence
    const storedPetsRaw = localStorage.getItem('userPets');
    const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
    
    const updatedPets = allPets.map(p => 
      p.id === pet.id ? { ...p, status: newStatus } : p
    );

    localStorage.setItem('userPets', JSON.stringify(updatedPets));
    // Dispatch storage event to notify other components if needed
    window.dispatchEvent(new Event('storage'));

    toast({
      title: `Estado de la mascota actualizado: ${statusTranslations[newStatus]}`,
      description: `${pet.name} ha sido marcado como ${statusTranslations[newStatus].toLowerCase()}.`,
    });
  };

  const isLost = pet.status === 'Lost';

  return (
    <div className="container max-w-5xl mx-auto py-8 sm:py-12">
      <Link href="/">
        <Button variant="ghost" className="mb-4">&larr; Volver al panel</Button>
      </Link>
      {pet.status === 'Lost' && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Esta mascota está perdida</CardTitle>
              <CardDescription className="text-destructive/80">
                Por favor, contacta al dueño inmediatamente si tienes alguna información. Tu ayuda es muy apreciada.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-muted">
              <Image
                src={pet.imageUrl}
                alt={`Foto de ${pet.name}`}
                fill
                className="object-cover"
                data-ai-hint={pet.imageHint}
                priority
              />
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {pet.species === 'Dog' ? <Dog className="h-6 w-6 text-muted-foreground" /> : <Cat className="h-6 w-6 text-muted-foreground" />}
                            <CardTitle className="text-4xl font-extrabold font-headline">{pet.name}</CardTitle>
                        </div>
                        <CardDescription className="text-lg">{pet.breed}</CardDescription>
                    </div>
                     <Badge variant={pet.status === 'Lost' ? 'destructive' : pet.status === 'Adoption' ? 'secondary' : 'default'} className="text-base">
                        {statusTranslations[pet.status]}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center my-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sexo</p>
                  <p className="font-semibold">{pet.sex === 'Male' ? 'Macho' : 'Hembra'}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-semibold">{pet.age}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-semibold">{pet.color}</p>
                </div>
                 <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Especie</p>
                  <p className="font-semibold">{pet.species === 'Dog' ? 'Perro' : pet.species === 'Cat' ? 'Gato' : 'Otro'}</p>
                </div>
              </div>
              
              {pet.microchip && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Microwave className="h-5 w-5 text-primary"/> Información del microchip</h3>
                  <p className="text-muted-foreground font-mono bg-muted/50 p-3 rounded-md">{pet.microchip}</p>
                </div>
              )}
              
              {pet.medicalNotes && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Stethoscope className="h-5 w-5 text-primary"/> Notas médicas</h3>
                  <p className="text-muted-foreground">{pet.medicalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pet.status === 'Adoption' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary"/> ¿Interesado en adoptar?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{pet.name} está buscando un hogar para siempre. Haz clic a continuación para iniciar el proceso de solicitud.</p>
                <AdoptionDialog pet={pet} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Controles del dueño</CardTitle>
                <CardDescription>Gestiona el estado y el perfil de tu mascota.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lost-mode"
                    checked={isLost}
                    onCheckedChange={handleStatusChange}
                  />
                  <Label htmlFor="lost-mode" className="text-base font-medium">Marcar como perdido</Label>
                </div>
                 <Button className="w-full" variant="outline" asChild>
                  <Link href={`/pets/${pet.id}/print`} target="_blank">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir cartel de mascota perdida
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary"/> Código QR único</CardTitle>
              <CardDescription>Escanea esto para acceder rápidamente al perfil de {pet.name}.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {qrCodeUrl ? (
                 <Image
                    src={qrCodeUrl}
                    alt={`Código QR para ${pet.name}`}
                    width={200}
                    height={200}
                    className="rounded-lg"
                    data-ai-hint="qr code"
                />
              ) : (
                <div className="h-[200px] w-[200px] bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Generando QR...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
