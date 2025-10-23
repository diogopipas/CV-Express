import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Resumes from './pages/Resumes';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';

function AppContent() {
  return (
    <Router>
      <GlobalLoadingOverlay />
      <Routes>
        {/* Auth routes without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Main app routes with Navbar */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-cyan-50 dark:from-purple-950 dark:via-indigo-950 dark:to-cyan-950">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Resumes />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" richColors />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

