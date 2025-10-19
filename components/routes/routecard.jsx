import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Heart, Navigation } from "lucide-react";

export default function RouteCard({ route, isFavorite, onToggleFavorite, onTrack }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: route.color || '#0ea5e9' }}
      />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${route.color || '#0ea5e9'}20` }}
            >
              <span 
                className="font-bold text-lg"
                style={{ color: route.color || '#0ea5e9' }}
              >
                {route.route_number}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">{route.route_name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {route.active_buses || 0} buses active
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(route)}
            className="rounded-full"
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
            <p className="text-gray-700">
              <span className="font-medium">{route.start_point}</span>
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
            <p className="text-gray-700">
              <span className="font-medium">{route.end_point}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{route.frequency || 'Every 15 mins'}</span>
          </div>
          <div>
            <span className="font-medium">{route.fare || '₹20-50'}</span>
          </div>
        </div>

        <Button 
          className="w-full"
          style={{ backgroundColor: route.color || '#0ea5e9' }}
          onClick={() => onTrack(route)}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Track Live
        </Button>
      </CardContent>
    </Card>
  );
}