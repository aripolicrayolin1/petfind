'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as CurrentUserType, Shelter } from '@/types';
import { CreditCard, LogOut, Settings, User, Shield, Building } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function UserNav() {
  const [currentUser, setCurrentUser] = useState<CurrentUserType | Shelter | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isShelter, setIsShelter] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user: CurrentUserType | Shelter = JSON.parse(storedUser);
          setCurrentUser(user);
          // Check if it's a user or a shelter and set avatar/status accordingly
          if ('avatarUrl' in user) {
            setAvatarUrl(user.avatarUrl || '');
            setIsShelter(false);
          } else {
            setAvatarUrl(''); // Shelters don't have avatars for now
            setIsShelter(true);
          }
        } else {
            setCurrentUser(null);
            setIsShelter(false);
        }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/'; 
  };

  const name = currentUser?.name || 'Usuario';
  const email = currentUser?.email || 'email@example.com';
  const fallback = name ? name.charAt(0).toUpperCase() : 'U';

  if (!currentUser) {
      return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={avatarUrl}
              alt={name}
            />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          {isShelter ? (
             currentUser && 'status' in currentUser && currentUser.status === 'approved' && (
                 <DropdownMenuItem asChild>
                  <Link href={`/shelters/${currentUser.id}`}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Perfil del Refugio</span>
                  </Link>
               </DropdownMenuItem>
             )
          ) : (
             <DropdownMenuItem asChild>
                <Link href="/shelters/apply">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Registrar Refugio</span>
                </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Facturación</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
