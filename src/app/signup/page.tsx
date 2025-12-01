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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, rellena todos los campos.',
      });
      return;
    }
    setLoading(true);
    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar el perfil del usuario de Firebase (opcional, pero útil)
      await updateProfile(user, { displayName: name });

      // 3. Crear el documento del usuario en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: name,
        email: user.email,
        avatarUrl: '', // Empieza sin avatar
        avatarHint: '',
        createdAt: new Date().toISOString(),
        pets: [], // Empieza sin mascotas
      });

      toast({
        title: '¡Cuenta creada!',
        description: 'Tu cuenta ha sido creada exitosamente. Bienvenido a PetFind.',
      });
      
      // 4. Redirigir al dashboard
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Error al registrarse:", error);
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: error.code === 'auth/email-already-in-use' 
            ? 'Este correo electrónico ya está en uso.' 
            : error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
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
              <Input id="name" placeholder="Alex Doe" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleSignup} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
