import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      const stored = localStorage.getItem('favorites_tf');
      if (stored) {
        try { setFavorites(JSON.parse(stored)); } catch (e) {}
      }
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs: string[] = [];
      snapshot.forEach(docSnap => {
        favs.push(docSnap.data().favoritedId);
      });
      setFavorites(favs);
      localStorage.setItem('favorites_tf', JSON.stringify(favs));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/favorites`);
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (id: string) => {
    const user = auth.currentUser;
    const isFav = favorites.includes(id);
    
    // Optimistic update
    const nextFavs = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(nextFavs);
    localStorage.setItem('favorites_tf', JSON.stringify(nextFavs));

    if (user) {
      try {
        if (isFav) {
          await deleteDoc(doc(db, 'users', user.uid, 'favorites', id));
        } else {
          await setDoc(doc(db, 'users', user.uid, 'favorites', id), {
            id,
            userId: user.uid,
            favoritedId: id,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/favorites/${id}`);
      }
    }
    
    window.dispatchEvent(new Event('favorites_changed'));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
}
