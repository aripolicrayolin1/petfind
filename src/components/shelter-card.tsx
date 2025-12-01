import { Shelter } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

type ShelterCardProps = {
  shelter: Shelter;
};

export function ShelterCard({ shelter }: ShelterCardProps) {
  return (
    <Card className="flex h-full transform flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl">{shelter.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            {shelter.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {shelter.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{shelter.phone}</span>
            </div>
        )}
        {shelter.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{shelter.email}</span>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/shelters/${shelter.id}`}>
              Ver Perfil <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
