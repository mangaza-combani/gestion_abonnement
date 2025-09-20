import React, { useState, useCallback, useEffect } from 'react';
import { Box, TextField } from '@mui/material';

const ClientEditForm = ({ client, onDataChange }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    city: '',
    birthday: ''
  });

  // Initialiser les données quand le client change
  useEffect(() => {
    if (client) {
      const userInfo = client?.user || client || {};
      const newData = {
        firstname: userInfo.firstname || '',
        lastname: userInfo.lastname || '',
        email: userInfo.email || '',
        phoneNumber: userInfo.phoneNumber || '',
        city: userInfo.city || '',
        birthday: userInfo.birthday || ''
      };
      console.log('🔄 Initializing form data:', newData);
      setFormData(newData);
      if (onDataChange) {
        onDataChange(newData);
      }
    }
  }, [client]);

  const handleFieldChange = useCallback((field, value) => {
    console.log('🔄 ClientEditForm field change:', { field, value });
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('🔄 New form data:', newData);
      if (onDataChange) {
        onDataChange(newData);
      }
      return newData;
    });
  }, [onDataChange]);

  // Handlers individuels
  const handleFirstnameChange = useCallback((e) => {
    handleFieldChange('firstname', e.target.value);
  }, [handleFieldChange]);

  const handleLastnameChange = useCallback((e) => {
    handleFieldChange('lastname', e.target.value);
  }, [handleFieldChange]);

  const handleEmailChange = useCallback((e) => {
    handleFieldChange('email', e.target.value);
  }, [handleFieldChange]);

  const handlePhoneChange = useCallback((e) => {
    handleFieldChange('phoneNumber', e.target.value);
  }, [handleFieldChange]);

  const handleCityChange = useCallback((e) => {
    handleFieldChange('city', e.target.value);
  }, [handleFieldChange]);

  const handleBirthdayChange = useCallback((e) => {
    handleFieldChange('birthday', e.target.value);
  }, [handleFieldChange]);

  console.log('🔍 ClientEditForm render:', { formData, client });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          label="Prénom"
          value={formData.firstname}
          onChange={handleFirstnameChange}
          fullWidth
        />
        <TextField
          size="small"
          label="Nom"
          value={formData.lastname}
          onChange={handleLastnameChange}
          fullWidth
        />
      </Box>
      <TextField
        size="small"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleEmailChange}
        fullWidth
      />
      <TextField
        size="small"
        label="Téléphone"
        value={formData.phoneNumber}
        onChange={handlePhoneChange}
        fullWidth
      />
      <TextField
        size="small"
        label="Ville"
        value={formData.city}
        onChange={handleCityChange}
        fullWidth
      />
      <TextField
        size="small"
        label="Date de naissance"
        placeholder="JJ/MM/AAAA"
        value={formData.birthday}
        onChange={handleBirthdayChange}
        fullWidth
      />
    </Box>
  );
};

export default ClientEditForm;