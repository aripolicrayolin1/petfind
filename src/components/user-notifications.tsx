'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'; // Corregido
import { Button } from './ui/button'; // Corregido
import { Bell, Trash2, MailOpen } from 'lucide-react';
import type { Notification, User } from '../types'; // Corregido
import Link from 'next/link';

export function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserAndNotifications = () => {
      const userRaw = localStorage.getItem('currentUser');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setCurrentUser(user);

        const allNotificationsRaw = localStorage.getItem('userNotifications');
        if (allNotificationsRaw) {
          const allNotifications: Notification[] = JSON.parse(allNotificationsRaw);
          const userNotifications = allNotifications.filter(
            (n) => n.ownerId === user.id
          );
          setNotifications(userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      }
    };

    fetchUserAndNotifications();
    window.addEventListener('storage', fetchUserAndNotifications);
    return () => {
      window.removeEventListener('storage', fetchUserAndNotifications);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const updateNotificationsInStorage = (userNotifications: Notification[]) => {
      if (!currentUser) return;
      const allNotificationsRaw = localStorage.getItem('userNotifications');
      const allNotifications: Notification[] = allNotificationsRaw ? JSON.parse(allNotificationsRaw) : [];
      
      const otherUserNotifications = allNotifications.filter(n => n.ownerId !== currentUser.id);
      
      const newMasterList = [...otherUserNotifications, ...userNotifications];

      localStorage.setItem('userNotifications', JSON.stringify(newMasterList));
      setNotifications(userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      window.dispatchEvent(new Event('storage'));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    updateNotificationsInStorage(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    updateNotificationsInStorage(updated);
  };
  
  const clearAll = () => {
      updateNotificationsInStorage([]);
  };

  const getLinkForItem = (notification: Notification): string => {
    if (notification.shelterId) {
        return `/shelters/${notification.shelterId}`;
    }
    if (notification.petId) {
        return `/pets/${notification.petId}`;
    }
    return '#';
  };

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>Limpiar todo</Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex items-start gap-2 ${
                !notification.read ? 'bg-accent/50' : ''
              }`}
              onSelect={(e) => e.preventDefault()} // Prevent closing
            >
              <div className="flex-grow">
                <Link href={getLinkForItem(notification)} className="block hover:bg-transparent">
                    <p className="text-sm leading-tight">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                </Link>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(notification.id)}>
                        <MailOpen className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNotification(notification.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-sm text-center text-muted-foreground">
            No tienes notificaciones.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
