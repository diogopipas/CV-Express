import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Saved from './pages/Saved';
import Resumes from './pages/Resumes';
import Applications from './pages/Applications';
import Login from './pages/Login';
import Register from './pages/Register';
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
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/saved" element={<Saved />} />
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
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

