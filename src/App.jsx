import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WizardLayout from './components/wizard/WizardLayout';
import './assets/css/app.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WizardLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
