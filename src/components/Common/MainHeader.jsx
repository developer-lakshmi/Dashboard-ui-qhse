import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import Assets from "../../assets/Assets"

export const MainHeader = ({ 
  title = "QHSE Dashboard",
  subtitle = "Quality, Health, Safety & Environment Monitoring System",
  lastUpdated = null,
  dataLastChanged = null, // ✅ CHANGED: Use data change time instead of file modification time
  isRefreshing = false
}) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      // ✅ UPDATED: Use data change time if available, fallback to fetch time
      const sourceTime = dataLastChanged || lastUpdated;
      
      if (!sourceTime) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const diffMs = now - sourceTime;
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        setTimeAgo(`Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`);
      } else if (diffHours > 0) {
        setTimeAgo(`Updated ${diffHours}h ago`);
      } else if (diffMinutes > 0) {
        setTimeAgo(`Updated ${diffMinutes}m ago`);
      } else {
        setTimeAgo('Updated just now');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated, dataLastChanged]);

  return (
    <header className="mb-8">
      <div className="flex items-center gap-4">
        <img
          src={Assets.qhse_rejler_logo}
          alt="QHSE Logo"
          className=" drop-shadow-md w-24 max-w-full h-auto rounded-full"
        />
        {/* <img
          src={Assets.qhseLogo}
          alt="QHSE Logo"
          className="dark:hidden drop-shadow-md w-24 max-w-full h-auto rounded-full"
        />
        <img
          src={Assets.qhse_dark}
          alt="QHSE Logo"
          className="hidden dark:block drop-shadow-md w-24 max-w-full h-auto rounded-full"
        /> */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {subtitle}
          </p>
          
          <div className="p-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isRefreshing ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <span className="text-xs font-medium">
                {isRefreshing ? 'Updating...' : 'Live data from Google Sheets'}
                {/* ✅ UPDATED: Show when data content actually changed */}
                {timeAgo && ` • ${timeAgo}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}