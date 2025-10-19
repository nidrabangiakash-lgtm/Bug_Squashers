
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Heart, 
  MapPin, 
  LogOut, 
  Bell, 
  Palette,
  Mail,
  Shield,
  Loader2
} from "lucide-react";

const THEME_COLORS = [
  { name: "Sky Blue", value: "#0ea5e9" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
];

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check authentication
  const { data: isAuthenticated, isLoading: authLoading } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
    staleTime: Infinity, // Authentication status is not expected to change often without a refresh/action
    cacheTime: Infinity,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(createPageUrl("Landing"));
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    enabled: !!isAuthenticated, // Only fetch user data if authenticated
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.FavoriteRoute.filter({ user_email: user?.email }),
    enabled: !!user, // Only fetch favorites if user data is available
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleToggleNotifications = () => {
    updateUserMutation.mutate({
      notifications_enabled: !user?.notifications_enabled
    });
  };

  const handleChangeTheme = (color) => {
    updateUserMutation.mutate({
      theme_color: color
    });
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    queryClient.invalidateQueries({ queryKey: ['isAuthenticated'] }); // Invalidate auth status
    queryClient.removeQueries(); // Clear all queries on logout
    navigate(createPageUrl("Landing"));
  };

  if (authLoading || (isAuthenticated && userLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirection, so no need to render anything here.
  // This ensures that the rest of the component only renders if isAuthenticated is true.
  if (!isAuthenticated) {
    return null; 
  }

  const themeColor = user?.theme_color || "#0ea5e9";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <div 
            className="h-32"
            style={{ 
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)` 
            }}
          />
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white flex-shrink-0">
                <User className="w-16 h-16" style={{ color: themeColor }} />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.full_name || 'User'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <Badge 
                    className="text-white border-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role || 'user'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Heart className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{favorites.length}</p>
              <p className="text-sm text-gray-600 mt-1">Favorite Routes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <MapPin className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600 mt-1">Trips Tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Bell className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {user?.notifications_enabled ? 'ON' : 'OFF'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <Label htmlFor="notifications" className="text-base font-medium cursor-pointer">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Get alerts for delays and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={user?.notifications_enabled ?? true}
                  onCheckedChange={handleToggleNotifications}
                  disabled={updateUserMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Color */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Color
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChangeTheme(color.value)}
                    disabled={updateUserMutation.isPending}
                    className={`w-full aspect-square rounded-xl transition-all duration-200 hover:scale-110 ${
                      themeColor === color.value 
                        ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' 
                        : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Selected: {THEME_COLORS.find(c => c.value === themeColor)?.name || 'Sky Blue'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full h-14 text-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout from Account
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="font-medium">Where is My Bus v1.0</p>
          <p className="text-sm mt-2">Made with ❤️ for better commutes</p>
        </div>
      </div>
    </div>
  );
}
