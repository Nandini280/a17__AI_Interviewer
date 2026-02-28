import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Resume from './pages/Resume';
import Interview from './pages/Interview';
import Results from './pages/Results';
import PastInterviews from './pages/PastInterviews';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview/:id" element={<Interview />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/past-interviews" element={<PastInterviews />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
