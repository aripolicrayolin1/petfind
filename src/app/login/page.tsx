'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Bienvenido de vuelta!',
        description: 'Has iniciado sesión correctamente.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente con Google.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error);
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión con Google',
        description: error.message || 'No se pudo completar el inicio de sesión con Google.',
      });
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <Button type="button" className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? 'Iniciando sesión...' : <><LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión</>}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? 'Un momento...' : 'Iniciar Sesión con Google'}
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
