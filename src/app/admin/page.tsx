'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shelter, Notification } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [shelterRequests, setShelterRequests] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const allRequestsRaw = localStorage.getItem('shelterRequests');
    const allRequests: Shelter[] = allRequestsRaw ? JSON.parse(allRequestsRaw) : [];
    setShelterRequests(allRequests);
    setIsLoading(false);
  }, []);

  const updateShelterStatus = (id: string, status: 'approved' | 'rejected') => {
    let targetShelter: Shelter | undefined;
    const updatedRequests = shelterRequests.map((req) => {
      if (req.id === id) {
        targetShelter = { ...req, status };
        return targetShelter;
      }
      return req;
    });

    setShelterRequests(updatedRequests);
    localStorage.setItem('shelterRequests', JSON.stringify(updatedRequests));

    if (targetShelter) {
      // Create a notification for the user who applied
      const notification: Notification = {
          id: `notif-${Date.now()}`,
          ownerId: targetShelter.ownerId, // This is the user who applied
          message: `Tu solicitud para el refugio "${targetShelter.name}" ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`,
          shelterId: targetShelter.id,
          createdAt: new Date().toISOString(),
          read: false,
      };

      const allNotificationsRaw = localStorage.getItem('userNotifications');
      const allNotifications: Notification[] = allNotificationsRaw ? JSON.parse(allNotificationsRaw) : [];
      localStorage.setItem('userNotifications', JSON.stringify([...allNotifications, notification]));
      window.dispatchEvent(new Event('storage'));

      toast({
          title: 'Estado actualizado',
          description: `El refugio "${targetShelter.name}" ha sido ${status} y se ha notificado al usuario.`
      })
    }
  };

  const getSheltersByStatus = (status: Shelter['status']) => {
    return shelterRequests.filter((req) => req.status === status);
  };
  
  if (isLoading) {
      return <div className="container mx-auto py-8">Cargando solicitudes...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Panel de Administrador</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de registro de refugios.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pendientes ({getSheltersByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas ({getSheltersByStatus('approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({getSheltersByStatus('rejected').length})</TabsTrigger>
        </TabsList>
        
        {['pending', 'approved', 'rejected'].map(status => (
            <TabsContent key={status} value={status}>
                <Card>
                    <CardHeader>
                        <CardTitle className="capitalize">{status}</CardTitle>
                        <CardDescription>
                            {status === 'pending' && 'Estas solicitudes necesitan revisión.'}
                            {status === 'approved' && 'Estos refugios han sido aprobados y son visibles públicamente.'}
                            {status === 'rejected' && 'Estos refugios han sido rechazados.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {getSheltersByStatus(status as Shelter['status']).length > 0 ? (
                             getSheltersByStatus(status as Shelter['status']).map(shelter => (
                                <div key={shelter.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg">{shelter.name}</p>
                                        <p className="text-sm text-muted-foreground">{shelter.address}</p>
                                        <p className="text-sm text-muted-foreground">{shelter.email} | {shelter.phone}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Solicitado por ID de usuario: {shelter.ownerId}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => updateShelterStatus(shelter.id, 'approved')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Aprobar
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => updateShelterStatus(shelter.id, 'rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4" /> Rechazar
                                                </Button>
                                            </>
                                        )}
                                        {status !== 'pending' && (
                                            <Badge variant={status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                                                {status === 'approved' ? <CheckCircle className="mr-1"/> : <XCircle className="mr-1"/>}
                                                {status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                             ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No hay solicitudes en esta categoría.</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}