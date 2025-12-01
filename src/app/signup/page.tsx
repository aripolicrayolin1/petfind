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
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useState } from 'react';
import type { User } from '@/types';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignup = () => {
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatarUrl: '', // New users start with no avatar
      avatarHint: '',
    };
    
    // Create or update a local "user database" for login purposes
    const allUsersRaw = localStorage.getItem('userDatabase');
    const allUsers = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    localStorage.setItem('userDatabase', JSON.stringify([...allUsers, user]));

    // Log the user in immediately
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Crear una cuenta de Dueño</CardTitle>
            <CardDescription>
              Únete a nuestra comunidad para proteger a tus mascotas y ayudar a otros.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" placeholder="Alex Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleSignup}>
                Crear cuenta
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
