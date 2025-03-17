// src/components/agencies/AgencyDetails/AgencyCollaborators.jsx
import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Typography,
  Card,
  CardContent,
  Box,
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';

const AgencyCollaborators = ({ collaborators }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Collaborateurs ({collaborators.length})</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
          >
            Ajouter
          </Button>
        </Box>
        
        <List>
          {collaborators.map((collaborator, index) => (
            <React.Fragment key={collaborator.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {collaborator.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={collaborator.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {collaborator.role}
                      </Typography>
                      {` — ${collaborator.email}`}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < collaborators.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        {collaborators.length === 0 && (
          <Box textAlign="center" py={3}>
            <PersonIcon color="disabled" sx={{ fontSize: 48 }} />
            <Typography color="text.secondary" mt={1}>
              Aucun collaborateur
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyCollaborators;