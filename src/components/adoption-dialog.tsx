'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Pet, User, AdoptionApplication } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AdoptionDialog({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser');
    if (userRaw) {
        const user = JSON.parse(userRaw);
        // Ensure it's a user profile, not a shelter profile
        if (!('status' in user)) {
             setCurrentUser(user);
        }
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!currentUser) {
        toast({
            variant: 'destructive',
            title: 'Debes iniciar sesión',
            description: 'Por favor, inicia sesión como dueño de mascota para solicitar una adopción.',
        });
        router.push('/login');
        return;
    }

    if (!pet.shelterId) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Esta mascota no pertenece a un refugio y no puede ser adoptada.',
        });
        return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    
    const newApplication: AdoptionApplication = {
        id: `app-${Date.now()}`,
        petId: pet.id,
        petName: pet.name,
        shelterId: pet.shelterId,
        applicantId: currentUser.id,
        applicantName: formData.get('name') as string,
        applicantEmail: formData.get('email') as string,
        applicantPhone: formData.get('phone') as string,
        applicantAddress: formData.get('address') as string,
        reason: formData.get('reason') as string,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const allApplicationsRaw = localStorage.getItem('adoptionApplications');
    const allApplications: AdoptionApplication[] = allApplicationsRaw ? JSON.parse(allApplicationsRaw) : [];
    localStorage.setItem('adoptionApplications', JSON.stringify([...allApplications, newApplication]));
    
    toast({
        title: '¡Solicitud enviada!',
        description: 'Tu solicitud ha sido enviada al refugio. Recibirás una notificación cuando sea revisada.',
    });
    
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
            <Heart className="mr-2 h-4 w-4" /> Adoptarme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Solicitud de adopción para {pet.name}</DialogTitle>
          <DialogDescription>
            Completa tu información para que el refugio pueda revisar tu perfil.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" className="col-span-3" defaultValue={currentUser?.name} required disabled={!currentUser} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Correo
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" defaultValue={currentUser?.email} required disabled={!currentUser} />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input id="phone" name="phone" type="tel" className="col-span-3" required disabled={!currentUser} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Dirección
              </Label>
              <Input id="address" name="address" className="col-span-3" required disabled={!currentUser} />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                ¿Por qué adoptar?
              </Label>
              <Textarea
                id="reason"
                name="reason"
                className="col-span-3"
                placeholder={`Cuéntanos por qué serías un gran dueño para ${pet.name}.`}
                required
                disabled={!currentUser}
              />
            </div>
          </div>
          <DialogFooter>
            {currentUser ? (
                 <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Solicitud
                </Button>
            ) : (
                <Button asChild>
                    <Link href="/login">Iniciar sesión para aplicar</Link>
                </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
