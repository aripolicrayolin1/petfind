'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Shelter, Pet, User } from '@/types';
import { mockPets } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Building, Mail, MapPin, Phone, Pencil } from 'lucide-react';
import Link from 'next/link';
import PetCard from '@/components/pet-card';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function ShelterProfilePage() {
  const params = useParams<{ id: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | Shelter | null>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser');
    if(userRaw) setCurrentUser(JSON.parse(userRaw));
    
    if (params.id) {
      const allSheltersRaw = localStorage.getItem('shelterRequests');
      const allShelters: Shelter[] = allSheltersRaw ? JSON.parse(allSheltersRaw) : [];
      const foundShelter = allShelters.find(s => s.id === params.id);

      if (foundShelter) {
        setShelter(foundShelter);
        
        const allPetsRaw = localStorage.getItem('userPets');
        const allPets: Pet[] = allPetsRaw ? JSON.parse(allPetsRaw) : mockPets;
        
        const shelterPets = allPets.filter(p => p.ownerId === foundShelter.id && p.status === 'Adoption');
        setPets(shelterPets);

      } else {
        setShelter(null);
      }
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto py-8">Cargando perfil del refugio...</div>;
  }

  if (!shelter) {
    return notFound();
  }

  const isOwner = currentUser?.id === shelter.ownerId;

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="relative h-64 md:h-80 w-full bg-muted rounded-b-lg overflow-hidden">
            {shelter.imageUrl && (
                <Image 
                    src={shelter.imageUrl}
                    alt={`Foto de ${shelter.name}`}
                    fill
                    className="object-cover"
                    data-ai-hint={shelter.imageHint}
                />
            )}
             {isOwner && (
                <Button asChild className="absolute top-4 right-4 z-10">
                    <Link href={`/shelters/${shelter.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                    </Link>
                </Button>
            )}
        </div>

        <div className="px-4 md:px-8 pb-12">
            <div className="text-center -mt-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">{shelter.name}</h1>
                <p className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" /> {shelter.address}
                </p>
            </div>

            <Card className="mt-8">
                 <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                     <div className="flex flex-col items-center gap-2">
                        <Phone className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Contacto</h3>
                            <p className="text-sm text-muted-foreground">{shelter.phone}</p>
                        </div>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Correo</h3>
                            <p className="text-sm text-muted-foreground break-all">{shelter.email}</p>
                        </div>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Building className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Sobre nosotros</h3>
                            <p className="text-sm text-muted-foreground">Dedicados a salvar vidas. ¡Ayúdanos a encontrarles un hogar!</p>
                        </div>
                    </div>
                 </CardContent>
            </Card>

            <div className="mt-8">
                <Tabs defaultValue="adoption" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mx-auto max-w-lg">
                        <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                        <TabsTrigger value="adoption">Familia en Adopción ({pets.length})</TabsTrigger>
                        <TabsTrigger value="needs">Necesidades</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mt-6">
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-medium text-foreground">
                            Aún no hay publicaciones
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                            Pronto, los refugios podrán publicar aquí sus necesidades y eventos.
                            </p>
                        </div>
                    </TabsContent>
                    <TabsContent value="adoption" className="mt-6">
                        {pets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pets.map(pet => (
                                    <PetCard key={pet.id} pet={pet} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <h3 className="text-xl font-medium text-foreground">
                                No hay mascotas en adopción
                                </h3>
                                <p className="mt-2 text-muted-foreground">
                                Este refugio no tiene mascotas para adoptar en este momento.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                     <TabsContent value="needs" className="mt-6">
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-medium text-foreground">
                            Lista de necesidades
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                            Aquí aparecerán los artículos y donaciones que el refugio necesita.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
      </div>
    </div>
  );
}
