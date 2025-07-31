import React from 'react'
import Assets from "../../assets/Assets"

export const MainHeader = ({ 
  title = "QHSE Dashboard",
  subtitle = "Quality, Health, Safety & Environment Monitoring System",
  lastUpdated = null 
}) => (
  <header className="mb-8">
    <div className="flex items-center gap-4">
      <img
        src={Assets.qhseLogo}
        alt="QHSE Logo"
        className="dark:hidden drop-shadow-md w-24 max-w-full h-auto rounded-full"
      />
      <img
        src={Assets.qhse_dark}
        alt="QHSE Logo"
        className="hidden dark:block drop-shadow-md w-24 max-w-full h-auto rounded-full"
      />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          {subtitle}
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  </header>
)