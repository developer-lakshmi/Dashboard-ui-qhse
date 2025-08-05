import React from 'react'
import { Box } from "@mui/material"

export const PageLayout = ({ children }) => (
  <Box 
    sx={{ 
      p: 3, 
      minHeight: '100vh' 
    }}
    className="bg-[#f5f7fa] dark:bg-gray-900"
  >
    <div className="flex flex-col gap-y-4">
      {children}
    </div>
  </Box>
)