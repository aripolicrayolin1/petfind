'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { aiSuggestedBreeds } from '@/ai/flows/ai-suggested-breeds';
import Image from 'next/image';
import { BrainCircuit, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockPets } from '@/lib/data';
import type { Pet, User as CurrentUserType, Shelter } from '@/types';

const petFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  species: z.enum(['Dog', 'Cat', 'Other']),
  breed: z.string().min(2, { message: 'La raza es obligatoria.' }),
  color: z.string().min(2, { message: 'El color es obligatorio.' }),
  age: z.string().min(1, { message: 'La edad es obligatoria.' }),
  sex: z.enum(['Male', 'Female']),
  microchip: z.string().optional(),
  medicalNotes: z.string().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function PetRegistrationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedBreeds, setSuggestedBreeds] = useState<string[]>([]);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: 'Dog',
      breed: '',
      color: '',
      age: '',
      sex: 'Male',
      microchip: '',
      medicalNotes: '',
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setSuggestedBreeds([]);
    }
  };

  const handleSuggestBreed = async () => {
    if (!photoPreview) {
      toast({
        variant: 'destructive',
        title: 'No se ha seleccionado ninguna foto',
        description: 'Por favor, sube primero una foto de tu mascota.',
      });
      return;
    }

    setIsSuggesting(true);
    setSuggestedBreeds([]);
    try {
        const result = await aiSuggestedBreeds({ photoDataUri: photoPreview });
        setSuggestedBreeds(result.suggestedBreeds);
        toast({
          title: '¡Razas sugeridas!',
          description: 'Selecciona una raza sugerida o introduce la tuya.',
        });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error en la sugerencia de IA',
        description: 'No se pudieron sugerir razas. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  function onSubmit(data: PetFormValues) {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) {
        toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: 'No se pudo encontrar el usuario. Por favor, inicia sesión de nuevo.',
        });
        router.push('/login');
        return;
    }
    const currentUser: CurrentUserType | Shelter = JSON.parse(currentUserRaw);
    
    // Determine if the current user is a shelter based on the object structure
    const isShelter = 'status' in currentUser;
    const petStatus = isShelter ? 'Adoption' : 'Safe';
    
    const existingPetsRaw = localStorage.getItem('userPets');
    // Initialize with mockPets only if 'userPets' doesn't exist in localStorage
    const existingPets: Pet[] = existingPetsRaw ? JSON.parse(existingPetsRaw) : [];
    
    const newPet: Pet = {
        ...data,
        id: `pet-${Date.now()}`,
        status: petStatus,
        ownerId: currentUser.id, // The logged-in entity (user or shelter) is the owner
        shelterId: isShelter ? currentUser.id : null,
        imageUrl: photoPreview || `https://picsum.photos/seed/${Date.now()}/800/600`,
        imageHint: 'new pet',
    };

    const updatedPets = [...existingPets, newPet];
    localStorage.setItem('userPets', JSON.stringify(updatedPets));
    
    toast({
      title: '¡Mascota registrada!',
      description: `${data.name} ha sido añadido(a) con éxito.`,
    });
    router.push('/');
  }

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
                <Label htmlFor="picture">Foto de la mascota</Label>
                 <div className="w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center relative bg-muted/50 overflow-hidden">
                    {photoPreview ? (
                        <Image src={photoPreview} alt="Vista previa de la mascota" fill className="object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto h-12 w-12" />
                            <p className="mt-2 text-sm">Haz clic para subir una foto</p>
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
            <div className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="species">Especie</Label>
                        <Controller
                            control={form.control}
                            name="species"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dog">Perro</SelectItem>
                                        <SelectItem value="Cat">Gato</SelectItem>
                                        <SelectItem value="Other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="sex">Sexo</Label>
                        <Controller
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Macho</SelectItem>
                                        <SelectItem value="Female">Hembra</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input id="age" placeholder="p. ej., 2 años" {...form.register('age')} />
                     {form.formState.errors.age && <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>}
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" placeholder="p. ej., Dorado" {...form.register('color')} />
                     {form.formState.errors.color && <p className="text-sm text-destructive">{form.formState.errors.color.message}</p>}
                    </div>
                </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="breed">Raza</Label>
            <div className="flex items-center gap-2">
              <Input id="breed" placeholder="p. ej., Golden Retriever" {...form.register('breed')} />
              <Button type="button" variant="outline" onClick={handleSuggestBreed} disabled={!photoPreview || isSuggesting}>
                {isSuggesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BrainCircuit className="mr-2 h-4 w-4" />
                )}
                Sugerencia IA
              </Button>
            </div>
            {form.formState.errors.breed && <p className="text-sm text-destructive">{form.formState.errors.breed.message}</p>}
             {suggestedBreeds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <p className="text-sm text-muted-foreground w-full">Sugerencias:</p>
                {suggestedBreeds.map((breed, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-accent/20 text-accent-foreground hover:bg-accent/30"
                    onClick={() => form.setValue('breed', breed, { shouldValidate: true })}
                  >
                    {breed}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="microchip">ID del microchip</Label>
            <Input id="microchip" placeholder="Opcional" {...form.register('microchip')} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="medicalNotes">Notas médicas</Label>
            <Textarea
              id="medicalNotes"
              placeholder="p. ej., Alergias, medicamentos, lesiones pasadas (opcional)"
              {...form.register('medicalNotes')}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar mascota
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
