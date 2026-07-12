import { useState, useEffect } from 'react';
import { mockNotifications, Notification } from '../data/mock';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      const stored = localStorage.getItem('matchdeck_notifications');
      setNotifications(stored ? JSON.parse(stored) : mockNotifications);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes: Notification[] = [];
      snapshot.forEach(docSnap => {
        notes.push(docSnap.data() as Notification);
      });
      setNotifications(notes.length > 0 ? notes : mockNotifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/notifications`);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    const user = auth.currentUser;
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );

    if (user) {
      const target = notifications.find(n => n.id === id);
      if (target) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'notifications', id), { ...target, isRead: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/notifications/${id}`);
        }
      }
    }
  };

  const markAllAsRead = async () => {
    const user = auth.currentUser;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    if (user) {
      try {
        const promises = notifications.map(n => 
          setDoc(doc(db, 'users', user.uid, 'notifications', n.id), { ...n, isRead: true })
        );
        await Promise.all(promises);
      } catch (err) {
        console.error("Error marking all as read in Firestore:", err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
