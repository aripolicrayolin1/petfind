'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Shelter, User } from '@/types';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EditShelterPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [currentUser, setCurrentUser] = useState<User | Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser');
    const allSheltersRaw = localStorage.getItem('shelterRequests'); // Changed to shelterRequests
    
    if (userRaw) setCurrentUser(JSON.parse(userRaw));

    if (allSheltersRaw && params.id) {
        const allShelters: Shelter[] = JSON.parse(allSheltersRaw);
        const foundShelter = allShelters.find(s => s.id === params.id);
        if (foundShelter) {
            setShelter(foundShelter);
            setName(foundShelter.name);
            setAddress(foundShelter.address);
            setPhone(foundShelter.phone);
            setPhotoPreview(foundShelter.imageUrl || null);
        }
    }
    setLoading(false);
  }, [params.id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
      if (!shelter) return;
      setIsSaving(true);
      
      const allSheltersRaw = localStorage.getItem('shelterRequests'); // Changed to shelterRequests
      let allShelters: Shelter[] = allSheltersRaw ? JSON.parse(allSheltersRaw) : [];

      const updatedShelters = allShelters.map(s => {
          if (s.id === shelter.id) {
              return {
                  ...s,
                  name,
                  address,
                  phone,
                  imageUrl: photoPreview || s.imageUrl
              }
          }
          return s;
      });

      localStorage.setItem('shelterRequests', JSON.stringify(updatedShelters)); // Changed to shelterRequests

      // Also update currentUser if it's the same shelter
      if(currentUser && 'status' in currentUser && currentUser.id === shelter.id) {
        const updatedCurrentUser = updatedShelters.find(s => s.id === shelter.id);
        if (updatedCurrentUser) {
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            window.dispatchEvent(new Event('storage'));
        }
      }

      setTimeout(() => {
        setIsSaving(false);
        toast({
            title: '¡Perfil actualizado!',
            description: 'Los cambios en tu refugio se han guardado con éxito.',
        });
        router.push(`/shelters/${shelter.id}`);
      }, 1000);
  }

  if (loading) {
    return <div className="container mx-auto py-8">Cargando...</div>;
  }
  
  if (!shelter || !currentUser || !('id' in currentUser) || shelter.ownerId !== currentUser.id) {
    return notFound();
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-12">
        <Button variant="ghost" asChild className="mb-6">
            <Link href={`/shelters/${shelter.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Perfil del Refugio
            </Link>
        </Button>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-bold">Editar Perfil del Refugio</CardTitle>
            <CardDescription>
                Actualiza la información pública de tu refugio.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="picture">Foto de perfil</Label>
                    <div className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center relative bg-muted/50 overflow-hidden">
                        {photoPreview ? (
                            <Image src={photoPreview} alt="Vista previa del refugio" fill className="object-cover" />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <Upload className="mx-auto h-12 w-12" />
                                <p className="mt-2 text-sm">Sube una nueva foto</p>
                            </div>
                        )}
                        <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handlePhotoChange}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="shelterName">Nombre del Refugio</Label>
                    <Input id="shelterName" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="shelterAddress">Dirección</Label>
                    <Input id="shelterAddress" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono de contacto</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}