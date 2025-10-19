import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, MapPin, Heart, User, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Routes",
    url: createPageUrl("Routes"),
    icon: MapPin,
  },
  {
    title: "Notifications",
    url: createPageUrl("Notifications"),
    icon: Bell,
  },
  {
    title: "Favorites",
    url: createPageUrl("Favorites"),
    icon: Heart,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is on landing page
  const isLandingPage = currentPageName === "Landing";

  // Don't show navigation on landing page
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0 relative">
      <style>{`
        :root {
          --primary: 14 165 233;
          --primary-dark: 2 132 199;
          --accent: 20 184 166;
        }
        
        .bus-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
      `}</style>

      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation - Mobile & Desktop */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 lg:max-w-4xl lg:mx-auto lg:bottom-4 lg:left-4 lg:right-4 lg:rounded-2xl lg:border">
        <div className="grid grid-cols-5 h-20 lg:h-16">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                  isActive 
                    ? "text-sky-500" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <item.icon 
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                <span className={`text-xs font-medium ${
                  isActive ? "font-semibold" : ""
                }`}>
                  {item.title}
                </span>
                {isActive && (
                  <div className="absolute top-0 h-1 w-12 bg-sky-500 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}