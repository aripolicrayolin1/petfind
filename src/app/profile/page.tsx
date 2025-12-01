'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Camera, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import type { User } from '@/types';

export default function ProfilePage() {
  const { toast } = useToast();
  const { currentUser, loading: authLoading, reloadUserData } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      let newAvatarUrl = currentUser.avatarUrl;
      let newAvatarHint = currentUser.avatarHint;

      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${currentUser.id}/${avatarFile.name}`);
        const uploadResult = await uploadBytes(storageRef, avatarFile);
        newAvatarUrl = await getDownloadURL(uploadResult.ref);
        newAvatarHint = `A profile photo of ${name}`;
      }

      const updatedData: Partial<User> = {
        name: name,
        phone: phone,
        avatarUrl: newAvatarUrl,
        avatarHint: newAvatarHint,
      };

      const userDocRef = doc(db, 'users', currentUser.id);
      await updateDoc(userDocRef, updatedData);

      if (currentUser.auth) {
          await updateProfile(currentUser.auth, { 
              displayName: name, 
              photoURL: newAvatarUrl 
            });
      }

      await reloadUserData();

      toast({
        title: '¡Perfil actualizado!',
        description: 'Tus cambios han sido guardados con éxito.',
      });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message || 'No se pudieron guardar los cambios.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const fallback = name ? name.charAt(0).toUpperCase() : (currentUser?.email?.charAt(0).toUpperCase() || 'U');

  if (authLoading || !currentUser) {
    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p>Cargando perfil...</p>
        </div>
    );
  }

  return (
    <>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Tu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona la información de tu cuenta y tus preferencias.
          </p>
        </div>

        <div className="grid gap-8">
            <Card>
            <form onSubmit={handleSaveChanges}>
                <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>
                    Actualiza tu foto de perfil y tus datos personales aquí.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage
                        src={avatarPreview || undefined}
                        alt={name}
                        />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <Input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*"/>
                    <Button type="button" variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={handleAvatarButtonClick}>
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Cambiar avatar</span>
                    </Button>
                    </div>
                    <div className="grid gap-4 flex-1 w-full">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono (Opcional)</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234 5678" disabled={isSaving}/>
                        </div>
                    </div>
                </div>
                <div className="grid gap-2 pt-6">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" value={currentUser.email || ''} readOnly disabled />
                    <p className="text-xs text-muted-foreground">No puedes cambiar tu dirección de correo electrónico.</p>
                </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar cambios
                  </Button>
                </CardFooter>
            </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Registro de Refugio</CardTitle>
                    <CardDescription>
                        ¿Administras un refugio o rescate de animales? Regístralo para aparecer en nuestra plataforma y gestionar tus mascotas en adopción.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Al registrar tu refugio, podrás publicar animales para adopción, recibir solicitudes de adoptantes y mucho más. Tu solicitud será revisada por nuestro equipo.
                    </p>
                    <Button asChild>
                        <Link href="/shelters/apply">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Registrar mi Refugio
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
