import { useState } from'react';
import { useNavigate } from'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!username ||!password) {
      setError('用户名和密码不能为空');
      return false;
    }
    
    if (isRegistering && password!== confirmPassword) {
      setError('两次密码输入不一致');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const url = isRegistering 
       ? `${process.env.REACT_APP_API_URL}/api/register` 
        : `${process.env.REACT_APP_API_URL}/api/login`;
      
      const response = await axios.post(url, {
        username,
        password
      });
      
      if (response.data.success) {
        onLogin(response.data.data);
        navigate('/');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering? '注册' : '登录'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          
          {isRegistering && (
            <div className="form-group">
              <label>确认密码</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading? '处理中...' : isRegistering? '注册' : '登录'}
          </button>
        </form>
        
        <p className="toggle-link">
          {isRegistering 
           ? '已有账号？' 
            : '还没有账号？'}
          <button 
            type="button" 
            className="link-button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering? '登录' : '注册'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
