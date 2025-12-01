'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogIn } from 'lucide-react';
import type { User as CurrentUserType, Shelter } from '@/types';
import { mockUser } from '@/lib/data';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState(mockUser.email);
  const [password, setPassword] = useState('password123');

  const handleLogin = () => {
    // Check if it's the mock user first
    if (email === mockUser.email) {
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('isLoggedIn', 'true');
      window.dispatchEvent(new Event('storage'));
      window.location.href = '/';
      return;
    }

    // Check if it's a shelter trying to log in
    const shelterRequestsRaw = localStorage.getItem('shelterRequests');
    const shelterRequests: Shelter[] = shelterRequestsRaw ? JSON.parse(shelterRequestsRaw) : [];
    const foundShelter = shelterRequests.find(s => s.email.toLowerCase() === email.toLowerCase());

    if (foundShelter) {
        switch (foundShelter.status) {
            case 'approved':
                localStorage.setItem('currentUser', JSON.stringify(foundShelter));
                localStorage.setItem('isLoggedIn', 'true');
                window.dispatchEvent(new Event('storage'));
                window.location.href = '/';
                break;
            case 'pending':
                toast({
                    title: 'Solicitud pendiente',
                    description: 'Tu solicitud de refugio todavía está en revisión. Te notificaremos cuando sea aprobada.',
                    duration: 5000,
                });
                break;
            case 'rejected':
                 toast({
                    variant: 'destructive',
                    title: 'Solicitud rechazada',
                    description: 'Tu solicitud de registro para el refugio no fue aprobada.',
                    duration: 5000,
                });
                break;
        }
    } else {
        // Fallback for any other user (could be a registered user from signup)
        const allUsersRaw = localStorage.getItem('userDatabase'); // A hypothetical place for all users
        const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
        const foundUser = allUsers.find((u: CurrentUserType) => u.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
             localStorage.setItem('currentUser', JSON.stringify(foundUser));
             localStorage.setItem('isLoggedIn', 'true');
             window.dispatchEvent(new Event('storage'));
             window.location.href = '/';
        } else {
             toast({
                variant: 'destructive',
                title: 'Credenciales no válidas',
                description: 'No se encontró ninguna cuenta con ese correo electrónico.',
            });
        }
    }
  };
  
  const handleGoogleLogin = () => {
    const googleUser: CurrentUserType = {
        id: 'user-google-mock',
        name: 'Usuario de Google',
        email: 'google.user@example.com',
        avatarUrl: '',
        avatarHint: '',
    };
    localStorage.setItem('currentUser', JSON.stringify(googleUser));
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  }

  const heroImage = PlaceHolderImages.find(p => p.id === 'pet-7');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold font-headline">Inicia Sesión</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa a tu cuenta para seguir ayudando a más mascotas.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              Iniciar Sesión con Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-end p-12">
            <div className="text-white">
                <h2 className="text-4xl font-bold font-headline">Adopta, no compres.</h2>
                <p className="mt-2 text-lg max-w-md">Miles de amigos esperan un hogar. Tu decisión puede cambiar una vida para siempre.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
