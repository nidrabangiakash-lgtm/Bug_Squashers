
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Clock,
  Heart,
  Loader2,
  Navigation,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LiveBusMap from "../components/map/LiveBusMap";

export default function Routes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.BusRoute.list(),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.FavoriteRoute.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: [],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (route) => base44.entities.FavoriteRoute.create({
      route_id: route.id,
      route_number: route.route_number,
      user_email: user.email,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
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
    } else {
      addFavoriteMutation.mutate(route);
    }
  };

  const handleViewLive = (route) => {
    setSelectedRoute(route);
    setShowMapDialog(true);
  };

  const filteredRoutes = routes.filter(route =>
    route.route_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                All Bus Routes
              </h1>
              <p className="text-gray-600">Browse all routes with live location tracking</p>
            </div>
            <Badge className="bg-purple-500 px-4 py-2 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              Live Tracking Active
            </Badge>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routes..."
              className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-purple-500 shadow-sm"
            />
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {filteredRoutes.map(route => {
            const isFavorite = favorites.some(f => f.route_id === route.id);
            return (
              <Card
                key={route.id}
                className="hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: route.color || '#0ea5e9' }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Route Info */}
                    <div className="flex items-start gap-6 flex-1">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${route.color || '#0ea5e9'}20` }}
                      >
                        <span
                          className="font-bold text-2xl"
                          style={{ color: route.color || '#0ea5e9' }}
                        >
                          {route.route_number}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-xl">{route.route_name}</h3>
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            {route.active_buses || 0} buses live
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Start</p>
                              <p className="font-medium text-gray-900">{route.start_point}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">End</p>
                              <p className="font-medium text-gray-900">{route.end_point}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{route.frequency || 'Every 15 mins'}</span>
                          </div>
                          <div className="font-semibold text-gray-900">
                            Fare: {route.fare || '₹20-50'}
                          </div>
                          <div>
                            {route.first_bus} - {route.last_bus}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      <Button
                        onClick={() => handleViewLive(route)}
                        className="whitespace-nowrap"
                        style={{ backgroundColor: route.color || '#0ea5e9' }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        View Live
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleFavorite(route)}
                        className="whitespace-nowrap"
                      >
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            isFavorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                        {isFavorite ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredRoutes.length === 0 && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-600">Try a different search term</p>
            </Card>
          )}
        </div>
      </div>

      {/* Live Tracking Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedRoute?.color || '#0ea5e9'}20` }}
              >
                <span
                  className="font-bold"
                  style={{ color: selectedRoute?.color || '#0ea5e9' }}
                >
                  {selectedRoute?.route_number}
                </span>
              </div>
              <div>
                <div className="font-bold text-lg">{selectedRoute?.route_name}</div>
                <div className="text-sm text-gray-600 font-normal">
                  Live tracking - {selectedRoute?.active_buses || 0} buses active
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <LiveBusMap
              routes={selectedRoute ? [selectedRoute] : []}
              selectedRoute={selectedRoute}
              onBusClick={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
