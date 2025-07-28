import React, { createContext, useContext, useMemo } from "react";
import { Teacher } from "@/types";
import { useAuth } from "./AuthProvider";
import {
  useTeacherList,
  useFavoriteTeacherIds,
  useToggleFavoriteTeacher,
} from "@/api/teachers";

type FavoriteCtx = {
  favorites: Teacher[];
  favoriteIds: string[];
  toggleFavorite: (t: Teacher) => void;
  loading: boolean;
};

const FavoriteContext = createContext<FavoriteCtx>({
  favorites: [],
  favoriteIds: [],
  toggleFavorite: () => {},
  loading: true,
});

export default function FavoriteProvider({ children }: React.PropsWithChildren) {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;

  // Don’t query until we know the user
  const { data: favoriteIds = [], isLoading: favLoading } = useFavoriteTeacherIds(userId);
  const { data: teachers = [] } = useTeacherList();
  const { mutate: toggle } = useToggleFavoriteTeacher(userId);

  const favorites = useMemo(
    () => teachers.filter((t) => favoriteIds.includes(t.id)),
    [teachers, favoriteIds]
  );

  const toggleFavorite = (teacher: Teacher) => {
    const isFav = favoriteIds.includes(teacher.id);
    toggle({ teacherId: teacher.id, isFavorite: !isFav });
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoriteIds,
        toggleFavorite,
        loading: authLoading || favLoading,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);
