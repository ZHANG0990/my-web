import { BrowserRouter as Router, Routes, Route, Navigate } from'react-router-dom';
import { useState, useEffect } from'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import RuleManagement from './components/RuleManagement';
import Settings from './components/Settings';
import Header from './components/Header';
import AlertSystem from './components/AlertSystem';
import TrafficAnalysis from './components/TrafficAnalysis';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查本地存储中的认证状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setUser(JSON.parse(localStorage.getItem('user')));
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // 处理登录
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 处理登出
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <Router>
      {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
      <div className="container">
        <Routes>
          <Route path="/login" element={isAuthenticated? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
          <Route path="/" element={isAuthenticated? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/rules" element={isAuthenticated? <RuleManagement /> : <Navigate to="/login" />} />
          <Route path="/analysis" element={isAuthenticated? <TrafficAnalysis /> : <Navigate to="/login" />} />
          <Route path="/alerts" element={isAuthenticated? <AlertSystem /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated? <Settings /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuthenticated? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;