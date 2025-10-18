import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Resumes from './pages/Resumes';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { useThemeStore } from './store/useThemeStore';

function AppContent() {
  const { theme } = useThemeStore();
  
  return (
    <Router>
      <Routes>
        {/* Auth routes without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main app routes with Navbar */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-900">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Resumes />} />
                  <Route path="/saved" element={<Saved />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
      <Toaster position="top-right" theme={theme} />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

