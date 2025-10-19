import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, MapPin, Clock, Users, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BusDetailsSheet({ bus, onClose }) {
  if (!bus) return null;

  return (
    <AnimatePresence>
      <motion.div
        
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        
        className="fixed bottom-20 left-0 right-0 z-[1000] px-4"
      >
        <Card className="bg-white rounded-t-3xl shadow-2xl p-6 max-w-lg mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: bus.color }}
                >
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{bus.routeNumber}</h3>
                  <p className="text-sm text-gray-600">{bus.routeName}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Next Stop</p>
                <p className="font-semibold">{bus.nextStop}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600">ETA</p>
                </div>
                <p className="font-bold text-lg">{bus.eta}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600">Passengers</p>
                </div>
                <p className="font-bold text-lg">{bus.passengers}</p>
              </div>
            </div>

            <Badge 
              className="w-full justify-center py-2"
              style={{ backgroundColor: bus.color, color: 'white' }}
            >
              Live Tracking Active
            </Badge>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}