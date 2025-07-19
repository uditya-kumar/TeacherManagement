import { createContext, PropsWithChildren, useContext, useState } from "react";

type FavoriteData = {
  favorites: string[];
  toggleFavorite: (teacherId: string) => void;
};
const FavoriteContext = createContext<FavoriteData>({
  favorites: [],
  toggleFavorite: () => {},
});

export default function FavoriteProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (teacherId: string) => {
    const isFavorite = favorites.includes(teacherId);

    if (isFavorite) {
      setFavorites(favorites.filter((id) => id !== teacherId));
    } else {
      setFavorites([...favorites, teacherId]);
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);
