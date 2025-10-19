import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  Loader2,
  Trash2,
  CheckCheck,
  Filter
} from "lucide-react";
import NotificationPanel from "../components/notifications/NotificationPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Notifications() {
  const [filterType, setFilterType] = React.useState("all");
  const [filterSeverity, setFilterSeverity] = React.useState("all");
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date'),
    initialData: [],
  });

  const dismissNotificationMutation = useMutation({
    mutationFn: (notificationId) => base44.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => base44.entities.Notification.delete(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleDismiss = (notificationId) => {
    dismissNotificationMutation.mutate(notificationId);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllMutation.mutate();
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = filterType === "all" || notification.type === filterType;
    const severityMatch = filterSeverity === "all" || notification.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  // Count by severity
  const severityCounts = {
    high: notifications.filter(n => n.severity === 'high').length,
    medium: notifications.filter(n => n.severity === 'medium').length,
    low: notifications.filter(n => n.severity === 'low').length,
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600">Stay updated with bus alerts and updates</p>
                </div>
              </div>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Badge className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{severityCounts.high}</p>
                  <p className="text-sm text-gray-600">High Priority</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Badge className="w-2 h-2 bg-yellow-500 rounded-full" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{severityCounts.medium}</p>
                  <p className="text-sm text-gray-600">Medium Priority</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Badge className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{severityCounts.low}</p>
                  <p className="text-sm text-gray-600">Low Priority</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="delay">Delays</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="passenger_count">Passenger Count</SelectItem>
                  <SelectItem value="route_change">Route Changes</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            {notifications.length === 0 ? (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600">
                  You're all caught up! Check back later for updates.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching notifications
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more notifications.
                </p>
              </>
            )}
          </Card>
        ) : (
          <NotificationPanel 
            notifications={filteredNotifications}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </div>
  );
}