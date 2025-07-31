import React from 'react'
import { Box } from "@mui/material"

export const PageLayout = ({ children, backgroundColor = '#f5f7fa' }) => (
  <Box sx={{ p: 3, backgroundColor, minHeight: '100vh' }}>
    <div className="flex flex-col gap-y-4">
      {children}
    </div>
  </Box>
)