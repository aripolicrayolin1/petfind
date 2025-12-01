'use client'

import { Map, AdvancedMarker, Pin, InfoWindow, useMap, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { Shelter } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ShelterMapProps {
    shelters: Shelter[];
}

export function ShelterMap({ shelters }: ShelterMapProps) {
    const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
    const map = useMap();
    const isApiLoaded = useApiIsLoaded();
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        // Escucha el evento de error de autenticación de la API de Google Maps
        const errorListener = window.google?.maps?.event?.addDomListener(
            window,
            'gm_auth_error',
            () => {
                setAuthError(true);
            }
        );

        return () => {
            if (errorListener && window.google) {
                window.google.maps.event.removeListener(errorListener);
            }
        };
    }, [isApiLoaded]);


    useEffect(() => {
        if (map && shelters.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            shelters.forEach(shelter => {
                bounds.extend(new window.google.maps.LatLng(shelter.lat, shelter.lng));
            });
            map.fitBounds(bounds);

            // Si solo hay un refugio, hacemos un poco de zoom
            if (shelters.length === 1) {
                map.setZoom(12);
            }

        }
    }, [map, shelters]);

    if (authError) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-lg border bg-background p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error de Configuración del Mapa</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">La clave de API de Google Maps no es válida o la facturación no está activada.</p>
                        <p className="mb-4">Asegúrate de que la clave en <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">.env</code> sea correcta y que la facturación esté habilitada en tu proyecto de Google Cloud.</p>
                        <Button asChild>
                           <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer">Ir a la Consola de Google Cloud</a>
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!isApiLoaded) {
        return (
             <div className="flex h-full w-full items-center justify-center rounded-lg border bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
             </div>
        )
    }

    return (
        <Map
            mapId={'petlink-shelters-map'}
            defaultCenter={{ lat: 23.6345, lng: -102.5528 }} // Centro de México
            defaultZoom={5}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            className="h-full w-full"
            onClick={() => setSelectedShelter(null)}
        >
            {shelters.map((shelter) => (
                <AdvancedMarker
                    key={shelter.id}
                    position={{ lat: shelter.lat, lng: shelter.lng }}
                    onClick={() => setSelectedShelter(shelter)}
                >
                    <Pin
                        background={'hsl(var(--accent))'}
                        borderColor={'hsl(var(--accent-foreground))'}
                        glyphColor={'hsl(var(--accent-foreground))'}
                    />
                </AdvancedMarker>
            ))}

            {selectedShelter && (
                <InfoWindow
                    position={{ lat: selectedShelter.lat, lng: selectedShelter.lng }}
                    onCloseClick={() => setSelectedShelter(null)}
                >
                    <div className="p-2">
                        <h3 className="font-bold">{selectedShelter.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedShelter.address}</p>
                    </div>
                </InfoWindow>
            )}
        </Map>
    );
}
