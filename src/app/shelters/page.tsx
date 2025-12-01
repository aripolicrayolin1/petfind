'use client';

import { useState, useEffect } from 'react';
import { Loader2, MapPin, Building, Search, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Shelter } from '@/types'; // Corrección: Usando la nueva sintaxis de importación de tipos
import { ShelterCard } from '@/components/shelter-card';
import { Input } from '@/components/ui/input';
import { ShelterMap } from '@/components/shelter-map';
import { APIProvider } from '@vis.gl/react-google-maps';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function SheltersPage() {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [petlinkShelters, setPetlinkShelters] = useState<Shelter[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Lógica para Refugios PetLink ---
  useEffect(() => {
    const fetchApprovedShelters = async () => {
      setSheltersLoading(true);
      setError(null);
      try {
        const sheltersCollection = collection(db, 'shelters');
        const q = query(sheltersCollection, where("status", "==", "approved"));
        
        const querySnapshot = await getDocs(q);
        const approvedShelters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shelter[];
        
        setPetlinkShelters(approvedShelters);

      } catch (err) {
        console.error("Error fetching approved shelters:", err);
        setError("No se pudieron cargar los refugios. Inténtalo más tarde.");
      } finally {
        setSheltersLoading(false);
      }
    };
    
    fetchApprovedShelters();
  }, []);

  const filteredPetlinkShelters = petlinkShelters.filter(shelter => 
      (shelter.shelterName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (shelter.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // --- Lógica para Mapa "Cerca de Ti" (sin cambios) ---
  useEffect(() => {
    const baseSearchQuery = "refugio de animales";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d11920.1!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s${encodeURIComponent(baseSearchQuery)}!5e0!3m2!1ses!2smx!4v1620000000000`;
          setMapUrl(url);
          setMapLoading(false);
        },
        () => {
          const url = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d11920.1!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s${encodeURIComponent(baseSearchQuery + ' en Mexico')}!5e0!3m2!1ses!2smx!4v1620000000000`;
          setMapUrl(url);
          setMapLoading(false);
        }
      );
    } else {
      const url = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d11920.1!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s${encodeURIComponent(baseSearchQuery + ' en Mexico')}!5e0!3m2!1ses!2smx!4v1620000000000`;
      setMapUrl(url);
      setMapLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-5xl">Encuentra un Refugio</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Usa el mapa para encontrar refugios cercanos o explora los perfiles de nuestros socios verificados.
        </p>
      </div>

      <Tabs defaultValue="petlink" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nearby">
            <MapPin className="mr-2 h-4 w-4" />
            Cerca de Ti
          </TabsTrigger>
          <TabsTrigger value="petlink">
             <Building className="mr-2 h-4 w-4" />
            Refugios PetLink
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nearby" className="mt-4">
             <div className="relative h-[calc(80vh)] w-full rounded-lg overflow-hidden border">
                {mapLoading ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-lg text-muted-foreground">Cargando mapa...</p>
                </div>
                ) : mapUrl ? (
                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa de Refugios Cercanos"></iframe>
                ) : (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80">
                    <MapPin className="h-10 w-10 text-destructive" />
                    <p className="mt-4 text-lg text-muted-foreground">No se pudo cargar el mapa.</p>
                    </div>
                )}
            </div>
             <p className="mt-2 text-xs text-center text-muted-foreground">
                El mapa muestra resultados de Google. Para una mejor experiencia, permite el acceso a tu ubicación.
            </p>
        </TabsContent>
        
        <TabsContent value="petlink" className="mt-4">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(80vh)]">
                  <div className="md:col-span-1 flex flex-col gap-4">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Buscar refugio por nombre o dirección..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <div className="overflow-y-auto pr-2 flex-grow">
                        {sheltersLoading ? (
                             <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 p-2">
                                        <Skeleton className="h-16 w-16 rounded-lg" />
                                        <div className="space-y-2 flex-grow">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                           <div className="flex flex-col items-center justify-center h-full text-center text-destructive-foreground bg-destructive/20 rounded-lg p-4">
                                <p>{error}</p>
                            </div>
                        ) : filteredPetlinkShelters.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredPetlinkShelters.map((shelter) => (
                                  <ShelterCard key={shelter.id} shelter={shelter as Shelter} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg p-4">
                                <Globe className="h-12 w-12 mb-4" />
                                <h3 className="font-semibold text-lg">No hay refugios aprobados aún</h3>
                                <p className="text-sm">¡Vuelve pronto! Nuevos refugios se unen a nuestra red constantemente.</p>
                            </div>
                        )}
                      </div>
                  </div>
                  <div className="md:col-span-2 rounded-lg overflow-hidden h-full border">
                      <ShelterMap shelters={filteredPetlinkShelters as Shelter[]} />
                  </div>
              </div>
          </APIProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
