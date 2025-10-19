import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Bus, MapPin, Heart, Zap, Clock, Shield } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const { data: isAuthenticated } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(createPageUrl("Home"));
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-8">
              <Bus className="w-8 h-8 text-sky-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Where is My Bus
              </h1>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Never Miss Your Bus Again
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Track buses in real-time, save your favorite routes, and get live updates. 
              Your daily commute made simple and stress-free.
            </p>
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get Started - Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-gray-600">
                See exact bus locations on an interactive map with real-time updates every few seconds.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Save Favorites</h3>
              <p className="text-gray-600">
                Bookmark your regular routes for instant access and faster commute planning.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Arrival Times</h3>
              <p className="text-gray-600">
                Get accurate estimated arrival times and never wait too long at the stop.
              </p>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">10+</div>
              <div className="text-gray-600">Active Routes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">30+</div>
              <div className="text-gray-600">Live Buses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-sky-600 mb-2">24/7</div>
              <div className="text-gray-600">Real-time Updates</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white rounded-3xl shadow-2xl p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Create your account and start tracking buses in seconds
            </p>
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}