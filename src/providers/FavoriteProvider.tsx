import React, { createContext, useContext, useMemo, useCallback } from "react";
import { Tables } from "@/types";
import { useAuth } from "./AuthProvider";
import {
  useTeacherList,
  useFavoriteTeacherIds,
  useToggleFavoriteTeacher,
} from "@/api/teachers";

type FavoriteCtx = {
  favorites: Tables<'teachers'>[];
  favoriteIds: string[];
  toggleFavorite: (t: Tables<'teachers'>) => void;
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

  // Memoize toggleFavorite to prevent recreation on every render
  const toggleFavorite = useCallback(
    (teacher: Tables<'teachers'>) => {
      const isFav = favoriteIds.includes(teacher.id);
      toggle({ teacherId: teacher.id, isFavorite: !isFav });
    },
    [favoriteIds, toggle]
  );

  // Derive loading state
  const loading = authLoading || favLoading;

  // Memoize the entire context value to prevent unnecessary re-renders
  const contextValue = useMemo<FavoriteCtx>(
    () => ({
      favorites,
      favoriteIds,
      toggleFavorite,
      loading,
    }),
    [favorites, favoriteIds, toggleFavorite, loading]
  );

  return (
    <FavoriteContext.Provider value={contextValue}>
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);
