import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatEnhanced from './pages/ChatEnhanced';
import Login from './pages/Login';
import ChatHistory from './pages/ChatHistory';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatEnhanced />} />
            <Route path="/login" element={<Login />} />
            <Route path="/history" element={<ChatHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
