'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Terminal, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Shelter, User } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ApplyShelterPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shelterName, setShelterName] = useState('');
  const [shelterAddress, setShelterAddress] = useState('');
  const [shelterPhone, setShelterPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser');
    if (userRaw) {
      setCurrentUser(JSON.parse(userRaw));
    } else {
      toast({
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para registrar un refugio.',
      });
      router.push('/login');
    }
  }, [router, toast]);
  
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

  const handleApply = () => {
    if (!currentUser) return;

    const defaultShelterImage = PlaceHolderImages.find(p => p.id === 'shelter-1');

    const newShelterRequest: Shelter = {
        id: `shelter-${Date.now()}`,
        name: shelterName,
        address: shelterAddress,
        city: '', 
        state: '', 
        phone: shelterPhone,
        email: currentUser.email,
        lat: 0,
        lng: 0,
        status: 'pending',
        hours: 'No especificado',
        ownerId: currentUser.id,
        imageUrl: photoPreview || defaultShelterImage?.imageUrl,
        imageHint: photoPreview ? 'custom shelter image' : defaultShelterImage?.imageHint,
    };

    const existingRequestsRaw = localStorage.getItem('shelterRequests');
    const existingRequests: Shelter[] = existingRequestsRaw ? JSON.parse(existingRequestsRaw) : [];
    localStorage.setItem('shelterRequests', JSON.stringify([...existingRequests, newShelterRequest]));

    setRequestSent(true);
  };

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center"><p>Redirigiendo...</p></div>;
  }
  
  if (requestSent) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
             <div className="w-full max-w-md">
                 <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>¡Solicitud enviada!</AlertTitle>
                  <AlertDescription>
                    <p>Gracias por registrar tu refugio. Tu solicitud ha sido enviada para su revisión.</p>
                    <p className="mt-2">Recibirás una notificación en tu cuenta una vez que sea aprobada.</p>
                    <Button asChild className="mt-4 w-full">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
            </div>
        </div>
      );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
        <Button variant="ghost" asChild className="mb-6">
            <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Perfil
            </Link>
        </Button>
        <Card>
            <CardHeader>
            <CardTitle className="text-2xl font-bold">Solicitud de Registro de Refugio</CardTitle>
            <CardDescription>
                Completa los datos de tu refugio. Serán revisados por nuestro equipo.
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="picture">Foto de perfil del refugio</Label>
                  <div className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center relative bg-muted/50 overflow-hidden">
                      {photoPreview ? (
                          <Image src={photoPreview} alt="Vista previa del refugio" fill className="object-cover" />
                      ) : (
                          <div className="text-center text-muted-foreground p-4">
                              <Upload className="mx-auto h-12 w-12" />
                              <p className="mt-2 text-sm">Haz clic para subir una foto (logo, fachada, etc.)</p>
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
                    <Input id="shelterName" placeholder="Refugio Corazón Canino" value={shelterName} onChange={(e) => setShelterName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="shelterAddress">Dirección del Refugio</Label>
                    <Input id="shelterAddress" placeholder="Calle Falsa 123, Ciudad" value={shelterAddress} onChange={(e) => setShelterAddress(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono de contacto</Label>
                    <Input id="phone" type="tel" placeholder="+52 55 1234 5678" value={shelterPhone} onChange={(e) => setShelterPhone(e.target.value)} required/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico de contacto (de tu cuenta)</Label>
                    <Input id="email" type="email" value={currentUser.email} disabled />
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleApply} disabled={!shelterName || !shelterAddress || !shelterPhone}>
                    Enviar solicitud de registro
                </Button>
            </CardFooter>
        </Card>
    </div>
  )
}
