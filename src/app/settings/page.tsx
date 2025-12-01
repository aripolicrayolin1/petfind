'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: '¡Configuración guardada!',
      description: 'Tus preferencias han sido actualizadas.',
    });
  };

  return (
    <>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en la aplicación.
          </p>
        </div>
        <form onSubmit={handleSaveChanges}>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                  Elige cómo quieres recibir las notificaciones importantes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Notificaciones por correo</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Recibe alertas sobre tus mascotas y noticias de la comunidad.
                    </span>
                  </Label>
                  <Switch
                    id="email-notifications"
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                    <span>Notificaciones push</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Recibe alertas en tiempo real en tu dispositivo.
                    </span>
                  </Label>
                  <Switch id="push-notifications" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                  Personaliza la apariencia de la aplicación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                    <span>Modo oscuro</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Activa el tema oscuro para una experiencia visual diferente.
                    </span>
                  </Label>
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </CardContent>
            </Card>
             <div className="flex justify-end">
                <Button type="submit">
                    <Save className="mr-2" />
                    Guardar cambios
                </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
