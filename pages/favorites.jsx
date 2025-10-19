
import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart } from "lucide-react";
import RouteCard from "../components/routes/RouteCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Favorites() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check authentication
  const { data: isAuthenticated, isLoading: authLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(createPageUrl("Landing"));
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.FavoriteRoute.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.BusRoute.list(),
    initialData: [],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.FavoriteRoute.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleToggleFavorite = (route) => {
    const favorite = favorites.find(f => f.route_id === route.id);
    if (favorite) {
      removeFavoriteMutation.mutate(favorite.id);
    }
  };

  const handleTrackRoute = (route) => {
    navigate(createPageUrl("Home") + `?route=${route.id}`);
  };

  const favoriteRoutes = routes.filter(route =>
    favorites.some(f => f.route_id === route.id)
  );

  // If authentication is still loading, show a loading state or nothing
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Skeleton className="w-full max-w-4xl h-96 rounded-2xl" />
      </div>
    );
  }

  const isLoading = favoritesLoading || routesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Favorites</h1>
              <p className="text-gray-600">Your saved routes</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : favoriteRoutes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding routes to your favorites for quick access
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {favoriteRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onTrack={handleTrackRoute}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
