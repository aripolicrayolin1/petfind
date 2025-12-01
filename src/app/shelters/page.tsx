'use client';

import { useState, useEffect } from 'react';
import { Loader2, MapPin, Building, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shelter } from '@/lib/types';
import { ShelterCard } from '@/components/shelter-card';
import { Input } from '@/components/ui/input';
import { ShelterMap } from '@/components/shelter-map';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function SheltersPage() {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [petlinkShelters, setPetlinkShelters] = useState<Shelter[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(true);

  // --- Lógica para Refugios PetLink ---
  useEffect(() => {
    const allSheltersRaw = localStorage.getItem('shelterRequests');
    const allShelters: Shelter[] = allSheltersRaw ? JSON.parse(allSheltersRaw) : [];
    const approvedShelters = allShelters.filter(s => s.status === 'approved');

    // Simulate coordinates for shelters that don't have them
    const sheltersWithCoords = approvedShelters.map((shelter, index) => ({
        ...shelter,
        lat: shelter.lat || (19.4326 + (Math.random() - 0.5) * 0.1 * index),
        lng: shelter.lng || (-99.1332 + (Math.random() - 0.5) * 0.1 * index),
    }));
    setPetlinkShelters(sheltersWithCoords);
    setSheltersLoading(false);
  }, []);

  const filteredPetlinkShelters = petlinkShelters.filter(shelter => 
      shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // --- Lógica para Mapa "Cerca de Ti" ---
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
          // Si el usuario deniega el permiso o hay un error
          const url = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d11920.1!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s${encodeURIComponent(baseSearchQuery + ' en Mexico')}!5e0!3m2!1ses!2smx!4v1620000000000`;
          setMapUrl(url);
          setMapLoading(false);
        }
      );
    } else {
      // Si el navegador no soporta geolocalización
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
                {mapLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    <p className="mt-4 text-lg text-muted-foreground">Cargando mapa...</p>
                </div>
                )}
                {mapUrl ? (
                <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de Refugios Cercanos"
                ></iframe>
                ) : (
                !mapLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80">
                    <MapPin className="h-10 w-10 text-destructive" />
                    <p className="mt-4 text-lg text-muted-foreground">No se pudo cargar el mapa.</p>
                    </div>
                )
                )}
            </div>
             <p className="mt-2 text-xs text-center text-muted-foreground">
                El mapa muestra resultados de Google. Para una mejor experiencia, permite que el navegador acceda a tu ubicación.
            </p>
        </TabsContent>
        
        <TabsContent value="petlink" className="mt-4">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(80vh)]">
                  <div className="md:col-span-1 flex flex-col gap-4">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              placeholder="Buscar en Refugios PetLink..." 
                              className="pl-10" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                          />
                      </div>
                      <div className="overflow-y-auto pr-2">
                        {sheltersLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                            </div>
                        ) : (
                            <>
                              {filteredPetlinkShelters.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-4">
                                      {filteredPetlinkShelters.map((shelter) => (
                                        <ShelterCard key={shelter.id} shelter={shelter} />
                                      ))}
                                  </div>
                              ) : (
                                  <div className="py-24 text-center">
                                      <p className="text-xl text-muted-foreground">No se encontraron refugios PetLink que coincidan con tu búsqueda.</p>
                                  </div>
                              )}
                            </>
                        )}
                      </div>
                  </div>
                  <div className="md:col-span-2 rounded-lg overflow-hidden h-full">
                      <ShelterMap shelters={filteredPetlinkShelters} />
                  </div>
              </div>
          </APIProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}