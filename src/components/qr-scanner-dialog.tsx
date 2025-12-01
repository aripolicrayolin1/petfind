'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { mockPets } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, ScanLine, Send } from 'lucide-react';
import PetCard from './pet-card';
import { Html5Qrcode } from 'html5-qrcode';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { Pet, Notification } from '@/types';

const QR_REGION_ID = "qr-scanner-region";

export function QrScannerDialog() {
  const [open, setOpen] = useState(false);
  const [scanResult, setScanResult] = useState<Pet | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const resetScannerState = () => {
    setScanResult(null);
    setScanError(null);
    setIsLoading(true);
  };
  
  const handleNotifyOwner = () => {
    console.log("SCAN RESULT:", scanResult);
    console.log("OWNER ID:", scanResult?.ownerId);
    
    if (!scanResult) {
      console.error("No hay resultado de escaneo para notificar.");
      return;
    }

    if (!scanResult.ownerId) {
      toast({
        title: 'No se puede notificar',
        description: 'Esta mascota no tiene un dueño asignado.',
        variant: 'destructive',
      });
      return;
    }

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      ownerId: scanResult.ownerId,
      message: `¡Alguien ha encontrado a ${scanResult.name}!`,
      petId: scanResult.id,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const existingNotificationsRaw = localStorage.getItem('userNotifications');
    const existingNotifications: Notification[] = existingNotificationsRaw ? JSON.parse(existingNotificationsRaw) : [];
    localStorage.setItem('userNotifications', JSON.stringify([...existingNotifications, newNotification]));
    
    window.dispatchEvent(new Event('storage'));

    toast({
      title: '¡Dueño notificado!',
      description: `Se ha enviado una notificación al dueño de ${scanResult.name}. ¡Gracias por ayudar!`,
    });
    setOpen(false); // Close dialog after notification
  };


  useEffect(() => {
    if (open) {
      resetScannerState();
      // Delay initialization to ensure the DOM element is ready
      const timer = setTimeout(() => {
        const scanner = new Html5Qrcode(QR_REGION_ID);
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText: string) => {
            scanner.stop().then(() => {
                try {
                    const urlPath = new URL(decodedText).pathname;
                    const petId = urlPath.split('/').pop();
                    
                    const storedPetsRaw = localStorage.getItem('userPets');
                    const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
                    const foundPet = allPets.find(p => p.id === petId);

                    if (foundPet) {
                        setScanResult(foundPet);
                    } else {
                        setScanError(`Código QR no válido. No se encontró ninguna mascota con la ID: ${petId}`);
                    }
                } catch (e) {
                    setScanError('El código QR no contiene una URL de PetFind válida.');
                } finally {
                    setIsLoading(false);
                }
            }).catch(err => {
                console.error("Failed to stop scanner after success:", err);
                setScanError("Error al detener el escáner. Recarga la página.");
                setIsLoading(false);
            });
        };

        const onScanFailure = (error: any) => {
            // This is verbose. We can ignore it for a better user experience.
        };

        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                ).then(() => setIsLoading(false))
                .catch(err => {
                    setScanError(`Error al iniciar la cámara: ${err.message}. Asegúrate de dar los permisos necesarios.`);
                    setIsLoading(false);
                });
            } else {
                setScanError("No se encontraron cámaras en este dispositivo.");
                setIsLoading(false);
            }
        }).catch(err => {
            setScanError(`Error de cámara: ${err.message}.`);
            setIsLoading(false);
        });

      }, 300);

      return () => clearTimeout(timer);

    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error al detener escáner al cerrar:", err));
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <ScanLine className="mr-2 h-5 w-5" /> Iniciar escáner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código QR</DialogTitle>
          <DialogDescription>
            Apunta la cámara de tu dispositivo al código QR de la placa de la mascota.
          </DialogDescription>
        </DialogHeader>

        {scanResult ? (
          <div className="my-4">
            <h3 className="text-center font-semibold mb-4 text-lg text-primary">¡Mascota encontrada!</h3>
            <div className="w-full max-w-xs mx-auto">
              <PetCard pet={scanResult} />
            </div>
            <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={handleNotifyOwner} className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" /> Notificar al dueño
                </Button>
                 <DialogClose asChild>
                    <Button variant="outline">Cerrar</Button>
                </DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center my-4">
            <div id={QR_REGION_ID} className="w-full h-full" />

            {(isLoading || scanError) && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-center p-4">
                    {isLoading && !scanError && (
                         <>
                             <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                             <p className="text-muted-foreground">Iniciando cámara...</p>
                         </>
                    )}
                    {scanError && (
                         <Alert variant="destructive">
                             <AlertTriangle className="h-4 w-4" />
                             <AlertTitle>Error del Escáner</AlertTitle>
                             <AlertDescription>
                                 {scanError}
                             </AlertDescription>
                         </Alert>
                    )}
                 </div>
            )}
            
            {!isLoading && !scanError && (
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                        className="w-[250px] h-[250px] border-4 border-dashed border-primary/50 rounded-lg"
                        style={{
                           boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                        }}
                    ></div>
                 </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
