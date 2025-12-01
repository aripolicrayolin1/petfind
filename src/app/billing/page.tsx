'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const { toast } = useToast();

  const handleUpgrade = (plan: string) => {
    toast({
      title: '¡Gracias por tu interés!',
      description: `La actualización al plan ${plan} estará disponible pronto.`,
    });
  };

  const plans = [
    {
      name: 'Gratis',
      price: '$0',
      description: 'Perfecto para empezar',
      features: [
        'Registra hasta 2 mascotas',
        'Notificaciones de mascota perdida',
        'Generación de cartel de mascota perdida',
      ],
      isCurrent: true,
    },
    {
      name: 'Pro',
      price: '$5',
      description: 'Para dueños de mascotas dedicados',
      features: [
        'Todo lo del plan Gratis',
        'Mascotas ilimitadas',
        'Verificación de reputación IA para adoptantes',
        'Soporte prioritario',
      ],
      isCurrent: false,
      recommended: true,
    },
    {
      name: 'Refugio',
      price: '$20',
      description: 'Para organizaciones y refugios',
      features: [
        'Todo lo del plan Pro',
        'Panel de gestión de refugios',
        'Listados de adopción destacados',
        'Analíticas avanzadas',
      ],
      isCurrent: false,
    },
  ];

  return (
    <>
      <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-headline sm:text-5xl">
            Planes y Facturación
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Elige el plan que mejor se adapte a tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'flex flex-col',
                plan.recommended && 'border-primary border-2 shadow-lg'
              )}
            >
              <CardHeader>
                {plan.recommended && (
                  <div className="text-sm font-bold text-primary text-center mb-2">
                    RECOMENDADO
                  </div>
                )}
                <CardTitle className="text-center text-2xl font-headline">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-center text-muted-foreground h-10">{plan.description}</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={plan.isCurrent}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.isCurrent ? 'Plan Actual' : 'Actualizar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
