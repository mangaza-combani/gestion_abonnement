import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

const tabs = [
  { id: 'list', label: 'LISTE DES CLIENTS' },
  { id: 'unblock', label: 'A DEBLOQUER' },
  { id: 'block', label: 'EN RETARD' },
  { id: 'order', label: 'A COMMANDER' },
  { id: 'late', label: 'RETARD' }
];

const ClientTabs = ({ currentTab, onTabChange }) => {
  return (
    <Box sx={{ bgcolor: 'white', boxShadow: 1 }}>
      <Tabs 
        value={currentTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            px: 4,
            '&.Mui-selected': {
              bgcolor: 'primary.light',
            }
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
};

export default ClientTabs;