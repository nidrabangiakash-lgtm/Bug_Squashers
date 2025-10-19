import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Clock, 
  Navigation, 
  Heart,
  Loader2,
  Bell
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LiveBusMap from "../components/map/LiveBusMap";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
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

  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => base44.entities.BusRoute.list(),
    initialData: [],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
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

  const handleTrackRoute = (route) => {
    setSelectedRoute(route);
    setShowMapDialog(true);
  };

  const filteredRoutes = routes.filter(route =>
    route.route_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Find Your Bus
              </h1>
              <p className="text-gray-600">Search and track buses in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
                onClick={() => navigate(createPageUrl("Notifications"))}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Badge className="bg-green-500 px-4 py-2 text-base">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                {routes.length} Routes Live
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by route number, name, or location..."
              className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-sky-500 shadow-sm"
            />
          </div>
        </div>

        {/* Routes Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : 'Available Routes'}
            </h2>
            <span className="text-gray-600">
              {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
            </span>
          </div>

          {filteredRoutes.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-600">Try searching with a different route number or location</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map(route => {
                const isFavorite = favorites.some(f => f.route_id === route.id);
                return (
                  <Card 
                    key={route.id} 
                    className="hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  >
                    <div 
                      className="h-3 w-full"
                      style={{ backgroundColor: route.color || '#0ea5e9' }}
                    />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${route.color || '#0ea5e9'}20` }}
                          >
                            <span 
                              className="font-bold text-xl"
                              style={{ color: route.color || '#0ea5e9' }}
                            >
                              {route.route_number}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-lg mb-1 truncate">
                              {route.route_name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {route.active_buses || 0} buses live
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(route);
                          }}
                          className="rounded-full flex-shrink-0"
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors ${
                              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-gray-700 font-medium">
                            {route.start_point}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-gray-700 font-medium">
                            {route.end_point}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-5 pb-5 border-b">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{route.frequency || 'Every 15 mins'}</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {route.fare || '₹20-50'}
                        </div>
                      </div>

                      <Button 
                        className="w-full group-hover:shadow-lg transition-all"
                        style={{ backgroundColor: route.color || '#0ea5e9' }}
                        onClick={() => handleTrackRoute(route)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Track Live
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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