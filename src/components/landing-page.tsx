'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PawPrint, HeartHandshake, QrCode } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


export default function LandingPage() {
    const router = useRouter();

  const features = [
    {
      icon: <PawPrint className="h-10 w-10 text-primary" />,
      title: 'Registra tu Mascota',
      description: 'Crea un perfil seguro para tu compañero para mantener su información a salvo.',
      link: '/pets/new',
      linkText: 'Registrar Ahora',
    },
    {
      icon: <HeartHandshake className="h-10 w-10 text-primary" />,
      title: 'Adopta un Amigo',
      description: 'Explora perfiles de mascotas en refugios y encuentra a tu nuevo mejor amigo.',
      link: '/adopt',
      linkText: 'Ver Mascotas',
    },
  ];

  const lostPetImage = PlaceHolderImages.find(p => p.id === 'pet-9');
  const qrImage = PlaceHolderImages.find(p => p.id === 'qr-code-placeholder');
  const awarenessImages = PlaceHolderImages.filter(p => ['pet-11', 'pet-12', 'pet-3', 'pet-4'].includes(p.id));

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            if (video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
              video.play().catch(error => console.error("Error al intentar reproducir el video:", error));
            }
            observer.unobserve(video);
          }
        });
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    videoRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      videoRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full min-h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
              src="https://videos.pexels.com/video-files/7516653/7516653-hd_1280_720_30fps.mp4"
            >
             <track kind="captions" />
            </video>
          
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          
          <div className="relative z-20 container px-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-7xl"
              >
                Unidos por su bienestar.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-4 max-w-xl mx-auto text-lg text-white/90"
              >
                PetFind conecta a mascotas perdidas con sus dueños y facilita la adopción responsable. Juntos por su seguridad y felicidad.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                <Button size="lg" asChild>
                    <Link href="/pets/new">Registrar Mascota</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black" asChild>
                    <Link href="/adopt">Buscar para Adoptar</Link>
                </Button>
              </motion.div>
          </div>
        </section>

        <section id="features" className="w-full py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold md:text-4xl">Todo lo que necesitas en un solo lugar</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                Nuestra plataforma está diseñada para la seguridad de tu mascota y para promover la adopción.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {features.map((feature, index) => (
                <Card key={index} className="flex transform flex-col text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader className="items-center pt-8">
                    {feature.icon}
                    <CardTitle className="font-headline text-2xl mt-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col p-8">
                    <p className="flex-grow text-muted-foreground">{feature.description}</p>
                    <Button asChild variant="link" className="mt-4 text-primary">
                        <Link href={feature.link}>{feature.linkText} &rarr;</Link>
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
            </div>
        </section>

        <section className="w-full bg-background">
            <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
                <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl md:h-96">
                    <video
                        ref={(el) => (videoRefs.current[0] = el)}
                        data-src="https://videos.pexels.com/video-files/20619931/20619931-hd_1920_1080_50fps.mp4"
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover z-0"
                    >
                      <track kind="captions" />
                    </video>
                </div>
                <div className="flex flex-col items-start gap-4">
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">¿Por qué registrar a tu mascota?</h2>
                    <p className="text-lg text-muted-foreground">
                        Registrar a tu mascota en PetFind crea un perfil digital único con un código QR. Si se pierde, cualquier persona con un smartphone puede escanear su placa para acceder a su perfil y contactarte al instante. Es la forma más rápida y segura de asegurar su regreso a casa.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/pets/new">Regístrala ahora y mantenla segura</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="w-full py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                 <div className="mx-auto mb-12 max-w-2xl text-center">
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">Adopta, Salva una Vida, Gana un Amigo</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Cada mascota merece un hogar amoroso. Al adoptar, no solo cambias su mundo, sino también el tuyo.
                    </p>
                </div>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {awarenessImages.map((image) => (
                            <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="aspect-[3/4] relative">
                                                 <Image
                                                    src={image.imageUrl}
                                                    alt={image.description}
                                                    fill
                                                    className="object-cover"
                                                    data-ai-hint={image.imageHint}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
                                                    {image.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
                 <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/adopt">Ver más mascotas en adopción</Link>
                    </Button>
                </div>
            </div>
        </section>

         <section className="w-full bg-background">
            <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
                <div className="md:order-last relative h-80 w-full overflow-hidden rounded-lg shadow-xl md:h-96">
                     <video
                        ref={(el) => (videoRefs.current[1] = el)}
                        data-src="https://videos.pexels.com/video-files/4977396/4977396-hd_1920_1080_24fps.mp4"
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover z-0"
                    >
                      <track kind="captions" />
                    </video>
                </div>
                <div className="flex flex-col items-start gap-4">
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">Encuentra un refugio, ofrece un hogar</h2>
                    <p className="text-lg text-muted-foreground">
                        Si encuentras una mascota perdida o en situación de calle, puedes ayudarla llevándola a un lugar seguro. Utiliza nuestro mapa para localizar los refugios y centros de rescate más cercanos a tu ubicación.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/shelters">Explorar refugios cercanos</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="w-full bg-muted/30">
            <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
                <div className="flex flex-col md:flex-row gap-4 md:order-last">
                     <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-2xl md:h-96 flex-1">
                        <video
                            ref={(el) => (videoRefs.current[2] = el)}
                            data-src="https://videos.pexels.com/video-files/6568959/6568959-uhd_4096_2160_25fps.mp4"
                            loop
                            muted
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover z-0"
                        >
                          <track kind="captions" />
                        </video>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-4 md:order-first">
                    <h2 className="font-headline text-3xl font-bold md:text-4xl">Ayuda a un amigo a volver a casa</h2>
                    <p className="text-lg text-muted-foreground">
                    Si encuentras una mascota perdida, cada segundo cuenta. Con el escáner QR de PetFind, puedes acceder al perfil de la mascota y notificar al dueño al instante. Sé un héroe para un compañero perdido.
                    </p>
                    <Button asChild size="lg">
                    <Link href="/scan">Aprende a usar el escáner QR</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>
       <footer className="bg-background border-t">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <p className="text-sm text-muted-foreground">&copy; 2024 PetFind. Todos los derechos reservados.</p>
                <div className="flex items-center gap-4">
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacidad</Link>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Términos</Link>
                </div>
            </div>
       </footer>
    </div>
  );
}
