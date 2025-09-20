import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  PeopleAlt,
  PhoneAndroid,
  Euro,
  TrendingUp,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/common/StatCard';


const mockData = {
  stats: {
    totalAgencies: 12,
    activeLines: 287,
    monthlyRevenue: '5,430 €',
    growthRate: '+12%',
  },
  chartData: [
    { month: 'Jan', revenue: 4200 },
    { month: 'Fév', revenue: 4800 },
    { month: 'Mar', revenue: 5430 },
  ],
};

const SupervisorDashboard = () => {
  return (
    <Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Agences Actives"
            value={mockData.stats.totalAgencies}
            icon={<PeopleAlt />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lignes Actives"
            value={mockData.stats.activeLines}
            icon={<PhoneAndroid />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenu Mensuel"
            value={mockData.stats.monthlyRevenue}
            icon={<Euro />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Croissance"
            value={mockData.stats.growthRate}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Revenus Mensuels
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={mockData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Activités Récentes
            </Typography>
            {/* Liste d'activités à implémenter */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupervisorDashboard;
