import { QrScannerDialog } from '@/components/qr-scanner-dialog';
import { ScanLine } from 'lucide-react';

export default function ScanPage() {
  return (
    <>
      <div className="container max-w-2xl mx-auto flex flex-col items-center justify-center text-center min-h-[calc(100vh-4rem)] py-12">
        <ScanLine className="h-24 w-24 text-primary animate-pulse" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground font-headline sm:text-5xl">
          Escanear Código QR
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
          Usa nuestro escáner para leer la etiqueta QR de la mascota. Podrás ver su perfil y notificar al dueño al instante.
        </p>
        <div className="mt-8">
          <QrScannerDialog />
        </div>
      </div>
    </>
  );
}
