import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cat, Dog, PawPrint } from 'lucide-react';
import type { Pet, PetStatus } from '@/types';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const getStatusBadgeVariant = (status: PetStatus) => {
    switch (status) {
      case 'Lost':
        return 'destructive';
      case 'Adoption':
        return 'secondary';
      default: // 'Safe'
        return 'default';
    }
  };

  const statusColors: Record<PetStatus, string> = {
    Lost: 'bg-destructive/10 border-destructive/50 text-destructive-foreground',
    Adoption: 'bg-secondary/10 border-secondary/50 text-secondary-foreground',
    Safe: 'bg-primary/10 border-primary/50 text-primary-foreground',
  };

  const statusTranslations: Record<PetStatus, string> = {
    Lost: 'Perdido',
    Adoption: 'En Adopción',
    Safe: 'A Salvo',
  };

  const PetIcon = () => {
    switch (pet.species) {
      case 'Dog':
        return <Dog className="h-5 w-5 text-muted-foreground" />;
      case 'Cat':
        return <Cat className="h-5 w-5 text-muted-foreground" />;
      default:
        return <PawPrint className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/pets/${pet.id}`}>
          <div className="aspect-[4/3] w-full relative">
            <Image
              src={pet.imageUrl}
              alt={`Foto de ${pet.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={pet.imageHint}
            />
          </div>
        </Link>
        <Badge
          className={cn(
            'absolute top-3 right-3',
            statusColors[pet.status]
          )}
        >
          {statusTranslations[pet.status]}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center gap-2 mb-2">
            <PetIcon />
            <CardTitle className="text-xl font-bold tracking-tight">
                <Link href={`/pets/${pet.id}`} className="hover:text-primary transition-colors">{pet.name}</Link>
            </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{pet.breed}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/pets/${pet.id}`}>
            Ver perfil <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
