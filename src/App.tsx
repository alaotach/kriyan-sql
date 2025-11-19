import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatEnhanced from './pages/ChatEnhanced';
import Login from './pages/Login';
import ChatHistory from './pages/ChatHistory';
import Profile from './pages/Profile';
import { SharedChatView } from './pages/SharedChatView';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatEnhanced /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/shared/:shareId" element={<SharedChatView />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
