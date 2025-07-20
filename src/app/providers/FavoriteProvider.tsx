import { createContext, PropsWithChildren, useContext, useState } from "react";
import { Teacher } from "@/types";

type FavoriteData = {
  favorites: Teacher[];
  toggleFavorite: (teacher: Teacher) => void;
};

const FavoriteContext = createContext<FavoriteData>({
  favorites: [],
  toggleFavorite: () => {},
});

export default function FavoriteProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<Teacher[]>([]);

  const toggleFavorite = (teacher: Teacher) => {
    const isFavorite = favorites.some((fav) => fav.id === teacher.id);

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== teacher.id));
    } else {
      setFavorites([...favorites, teacher]);
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);
