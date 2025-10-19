import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  XCircle, 
  Users, 
  Info,
  Clock,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const notificationIcons = {
  delay: AlertTriangle,
  cancelled: XCircle,
  passenger_count: Users,
  route_change: Info,
  info: Info,
};

const notificationColors = {
  delay: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "text-yellow-600",
    badge: "bg-yellow-500",
  },
  cancelled: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    badge: "bg-red-500",
  },
  passenger_count: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    badge: "bg-blue-500",
  },
  route_change: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-600",
    badge: "bg-purple-500",
  },
  info: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: "text-gray-600",
    badge: "bg-gray-500",
  },
};

export default function NotificationPanel({ notifications, onDismiss, compact = false }) {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = notificationIcons[notification.type] || Bell;
          const colors = notificationColors[notification.type] || notificationColors.info;
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`${colors.bg} ${colors.border} border-l-4 hover:shadow-md transition-shadow`}>
                <CardContent className={compact ? "p-3" : "p-4"}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${colors.badge} text-white`}>
                            {notification.route_number}
                          </Badge>
                          <h4 className="font-semibold text-sm text-gray-900">
                            {notification.title}
                          </h4>
                        </div>
                        {onDismiss && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => onDismiss(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {notification.timestamp 
                            ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                            : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}