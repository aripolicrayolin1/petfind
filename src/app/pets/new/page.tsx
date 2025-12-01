import PetRegistrationForm from '@/components/pet-registration-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewPetPage() {
  return (
    <div className="bg-muted/40 min-h-screen py-12">
      <div className="container max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al panel
            </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 font-headline">Registrar una nueva mascota</h1>
        <p className="text-muted-foreground mb-8">Completa los detalles a continuación para crear un perfil para tu compañero.</p>
        <PetRegistrationForm />
      </div>
    </div>
  );
}
