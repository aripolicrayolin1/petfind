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
import { Camera, Save, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { User as CurrentUserType } from '@/types';
import Link from 'next/link';


export default function ProfilePage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('currentUser');
    if (storedUserRaw) {
        const user: CurrentUserType = JSON.parse(storedUserRaw);
        setCurrentUser(user);
        setName(user.name);
        setAvatarPreview(user.avatarUrl || '');
    }
  }, []);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
        const updatedUser: CurrentUserType = { 
            ...currentUser, 
            name: name,
            avatarUrl: avatarPreview 
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage')); // Notify header to update
        toast({
            title: '¡Perfil actualizado!',
            description: 'Tus cambios han sido guardados con éxito.',
        });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const fallback = name ? name.charAt(0).toUpperCase() : 'U';

  if (!currentUser) {
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
                <div className="flex items-center gap-6">
                    <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage
                        src={avatarPreview}
                        alt={name}
                        />
                        <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={handleAvatarButtonClick}
                    >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Cambiar avatar</span>
                    </Button>
                    </div>
                    <div className="grid gap-2 flex-1">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" value={currentUser.email} readOnly disabled />
                    <p className="text-xs text-muted-foreground">
                    No puedes cambiar tu dirección de correo electrónico.
                    </p>
                </div>
                </CardContent>
                <CardContent className="border-t pt-6 flex justify-end">
                <Button type="submit">
                    <Save className="mr-2" />
                    Guardar cambios
                </Button>
                </CardContent>
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
                            <ShieldCheck className="mr-2" /> Registrar mi Refugio
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
