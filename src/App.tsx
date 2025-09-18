import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import Dashboard from './components/Dashboard';

const Shell: React.FC = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginView />;
};

const App: React.FC = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);

export default App;
