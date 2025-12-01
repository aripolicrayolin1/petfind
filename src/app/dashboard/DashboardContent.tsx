'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { mockUser, mockPets } from '@/lib/data';
import PetCard from '@/components/pet-card';
import { PlusCircle, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Pet, User as CurrentUserType, Shelter, AdoptionApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DashboardContent() {
  const [currentUser, setCurrentUser] = useState<CurrentUserType | Shelter | null>(null);
  const [isShelter, setIsShelter] = useState(false);
  
  // State for Pet Owners
  const [userPets, setUserPets] = useState<Pet[]>([]);

  // State for Shelters
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('currentUser');
    if (storedUserRaw) {
      const user: CurrentUserType | Shelter = JSON.parse(storedUserRaw);
      setCurrentUser(user);
      
      const shelterCheck = 'status' in user && (user.status === 'approved' || user.status === 'pending');
      setIsShelter(shelterCheck);

      if (shelterCheck) {
        // It's a shelter, load adoption applications
        const allApplicationsRaw = localStorage.getItem('adoptionApplications');
        const allApplications: AdoptionApplication[] = allApplicationsRaw ? JSON.parse(allApplicationsRaw) : [];
        const shelterApplications = allApplications.filter(app => app.shelterId === user.id);
        setApplications(shelterApplications);
      } else {
        // It's a pet owner, load their pets
        const storedPetsRaw = localStorage.getItem('userPets');
        const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
        const currentUserPets = allPets.filter((pet) => pet.ownerId === user.id);
        setUserPets(currentUserPets);
      }
    } else {
        // Fallback for when no user is logged in
        setIsShelter(false);
        const storedPetsRaw = localStorage.getItem('userPets');
        const allPets: Pet[] = storedPetsRaw ? JSON.parse(storedPetsRaw) : mockPets;
        const fallbackUserPets = allPets.filter((pet) => pet.ownerId === mockUser.id);
        setUserPets(fallbackUserPets);
    }
  }, []);

  const handleApplicationStatus = (applicationId: string, newStatus: 'approved' | 'rejected') => {
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);

      // Update master list in localStorage
      const allApplicationsRaw = localStorage.getItem('adoptionApplications');
      const allApplications: AdoptionApplication[] = allApplicationsRaw ? JSON.parse(allApplicationsRaw) : [];
      const finalApplications = allApplications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      localStorage.setItem('adoptionApplications', JSON.stringify(finalApplications));
      
      const targetApp = applications.find(app => app.id === applicationId);
      if (!targetApp) return;

      // Create notification for the applicant
      const statusText = newStatus === 'approved' ? 'aprobada' : 'rechazada';
      const notification = {
          id: `notif-${Date.now()}`,
          ownerId: targetApp.applicantId,
          message: `Tu solicitud de adopción para ${targetApp.petName} ha sido ${statusText}. El refugio se pondrá en contacto pronto.`,
          petId: targetApp.petId,
          createdAt: new Date().toISOString(),
          read: false,
      };

      const allNotificationsRaw = localStorage.getItem('userNotifications');
      const allNotifications = allNotificationsRaw ? JSON.parse(allNotificationsRaw) : [];
      localStorage.setItem('userNotifications', JSON.stringify([...allNotifications, notification]));
      window.dispatchEvent(new Event('storage'));

      toast({
          title: 'Estado de Solicitud Actualizado',
          description: `La solicitud de ${targetApp.applicantName} ha sido ${statusText}.`
      });
  };

  const getApplicationsByStatus = (status: AdoptionApplication['status']) => {
      return applications.filter(app => app.status === status);
  }

  // === RENDER SHELTER DASHBOARD ===
  if (isShelter && currentUser) {
    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                    Panel del Refugio: {currentUser.name}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                    Gestiona tus mascotas en adopción y las solicitudes de aplicantes.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/pets/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir mascota
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/shelters/${currentUser.id}/edit`}>
                           <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                        </Link>
                    </Button>
                </div>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Solicitudes Pendientes ({getApplicationsByStatus('pending').length})</TabsTrigger>
                  <TabsTrigger value="approved">Solicitudes Aprobadas ({getApplicationsByStatus('approved').length})</TabsTrigger>
                  <TabsTrigger value="rejected">Solicitudes Rechazadas ({getApplicationsByStatus('rejected').length})</TabsTrigger>
                </TabsList>
                
                {['pending', 'approved', 'rejected'].map(status => (
                    <TabsContent key={status} value={status}>
                        <Card>
                             <CardHeader>
                                <CardTitle className="capitalize">{status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                {getApplicationsByStatus(status as AdoptionApplication['status']).length > 0 ? (
                                    getApplicationsByStatus(status as AdoptionApplication['status']).map(app => (
                                        <div key={app.id} className="flex flex-col sm:flex-row items-start justify-between rounded-lg border p-4 gap-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    {/* In a real app, this would be the applicant's avatar */}
                                                    <AvatarFallback>{app.applicantName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow">
                                                    <p className="font-bold">{app.applicantName} <span className="font-normal text-muted-foreground">quiere adoptar a</span> <Link href={`/pets/${app.petId}`} className="font-bold hover:underline">{app.petName}</Link></p>
                                                    <p className="text-sm text-muted-foreground">{app.applicantEmail} | {app.applicantPhone}</p>
                                                    <p className="text-sm mt-2 italic">"{app.reason}"</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 self-center sm:self-auto">
                                                {status === 'pending' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleApplicationStatus(app.id, 'approved')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Aprobar
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleApplicationStatus(app.id, 'rejected')}>
                                                            <XCircle className="mr-2 h-4 w-4" /> Rechazar
                                                        </Button>
                                                    </>
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
    )
  }

  // === RENDER PET OWNER DASHBOARD ===
  return (
    <>
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
              ¡Bienvenido de vuelta, {currentUser?.name || 'Usuario'}!
            </h1>
            <p className="mt-1 text-muted-foreground">
              Aquí están tus compañeros registrados.
            </p>
          </div>
          <Button asChild>
            <Link href="/pets/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar nueva mascota
            </Link>
          </Button>
        </div>

        {userPets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-foreground">
              Aún no tienes mascotas registradas
            </h3>
            <p className="mt-2 text-muted-foreground">
              Comienza agregando a tu primera mascota para mantenerla segura.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/pets/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar una mascota
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
