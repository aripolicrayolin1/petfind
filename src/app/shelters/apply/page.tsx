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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Terminal, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shelterApplicationSchema, type ShelterApplicationValues } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ApplyShelterPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShelterApplicationValues>({
    resolver: zodResolver(shelterApplicationSchema),
    defaultValues: {
      shelterName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      story: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.setValue('email', currentUser.email || '');
    }
  }, [currentUser, form]);

  useEffect(() => {
    if (!currentUser) {
      toast({ 
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para registrar un refugio.'
      });
      router.push('/login');
    }
  }, [currentUser, router, toast]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ShelterApplicationValues) {
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      let imageUrl = 'https://via.placeholder.com/400x300.png?text=Sin+Imagen';
      let imageHint = 'placeholder image for a shelter';

      if (photoFile) {
        const storageRef = ref(storage, `shelters/${currentUser.id}/${photoFile.name}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, photoFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        imageHint = `Photo of the ${data.shelterName} shelter`;
      }

      const newShelterRequest = {
        ...data,
        ownerId: currentUser.id,
        status: 'pending' as const,
        imageUrl,
        imageHint,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'shelters'), newShelterRequest);
      setRequestSent(true);

    } catch (error: any) {
      console.error("Error submitting shelter application:", error);
      toast({
        variant: 'destructive',
        title: 'Error al enviar la solicitud',
        description: error.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (requestSent) {
      return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background p-4">
             <div className="w-full max-w-md">
                 <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>¡Solicitud Enviada!</AlertTitle>
                  <AlertDescription>
                    <p>Gracias por tu interés. Tu solicitud para registrar el refugio "{form.getValues('shelterName')}" ha sido enviada para su revisión.</p>
                    <p className="mt-2">Recibirás una notificación una vez que sea aprobada por nuestro equipo.</p>
                    <Button asChild className="mt-4 w-full">
                        <Link href="/dashboard">Volver a mi panel</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
            </div>
        </div>
      );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12">
        <Button variant="ghost" asChild className="mb-6">
            <Link href="/shelters">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Refugios
            </Link>
        </Button>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl font-bold">Solicitud de Registro de Refugio</CardTitle>
                <CardDescription>
                    Completa los datos de tu organización. Serán revisados por nuestro equipo antes de ser publicados.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="picture">Logo o foto del refugio</Label>
                      <div className="w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center relative bg-muted/50 overflow-hidden">
                          {photoPreview ? (
                              <Image src={photoPreview} alt="Vista previa del refugio" fill className="object-cover" />
                          ) : (
                              <div className="text-center text-muted-foreground p-4">
                                  <Upload className="mx-auto h-12 w-12" />
                                  <p className="mt-2 text-sm">Haz clic para subir una foto (logo, fachada, etc.)</p>
                              </div>
                          )}
                          <Input id="picture" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoChange} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="shelterName">Nombre del Refugio</Label>
                            <Input id="shelterName" {...form.register('shelterName')} />
                            {form.formState.errors.shelterName && <p className="text-sm text-destructive">{form.formState.errors.shelterName.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                            <Input id="phone" type="tel" {...form.register('phone')} />
                             {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico de contacto</Label>
                        <Input id="email" type="email" {...form.register('email')} disabled />
                         {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Dirección del Refugio</Label>
                        <Input id="address" {...form.register('address')} />
                        {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="website">Sitio Web (Opcional)</Label>
                        <Input id="website" type="url" placeholder="https://www.ejemplo.com" {...form.register('website')} />
                        {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="story">Tu Historia</Label>
                        <Textarea id="story" placeholder="Cuéntanos sobre la misión de tu refugio, cómo empezaste y qué te motiva."{...form.register('story')} className="min-h-[120px]" />
                        {form.formState.errors.story && <p className="text-sm text-destructive">{form.formState.errors.story.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                     <Button className="w-full" type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                        Enviar solicitud
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  )
}
