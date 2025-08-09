import { useState, useEffect } from'react';
import axios from 'axios';
import { FaBell, FaCheck, FaTimes, FaHistory } from'react-icons/fa';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/alerts?showResolved=${showResolved}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAlerts(response.data.data);
      setError('');
    } catch (err) {
      setError('获取告警信息失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [showResolved]);

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/alerts/${alertId}/resolve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId? {...alert, resolved: true } : alert
      ));
    } catch (err) {
      setError('处理告警失败，请重试');
      console.error(err);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/alerts/${alertId}/dismiss`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAlerts(alerts.filter(alert => alert.id!== alertId));
    } catch (err) {
      setError('忽略告警失败，请重试');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">加载告警信息中...</div>;

  return (
    <div className="alert-system">
      <div className="header-actions">
        <h2>系统告警</h2>
        <div className="alert-controls">
          <button 
            className="btn-secondary"
            onClick={() => setShowResolved(!showResolved)}
          >
            <FaHistory /> {showResolved? '只看未处理' : '显示已处理'}
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="alerts-list">
        {alerts.length === 0? (
          <p className="no-data">
            {showResolved? '没有已处理的告警' : '当前没有告警信息'}
          </p>
        ) : (
          <div className="alerts-container">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-card ${
                  alert.resolved? 'resolved' : 
                  alert.severity === 'high'? 'high' : 
                  alert.severity ==='medium'?'medium' : 'low'
                }`}
              >
                <div className="alert-header">
                  <div className="alert-severity">
                    {alert.severity === 'high' && '严重'}
                    {alert.severity ==='medium' && '中等'}
                    {alert.severity === 'low' && '轻微'}
                  </div>
                  <div className="alert-time">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="alert-content">
                  <h3>{alert.title}</h3>
                  <p>{alert.description}</p>
                  {alert.details && (
                    <div className="alert-details">
                      <h4>详细信息:</h4>
                      <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                    </div>
                  )}
                  {alert.suggestion && (
                    <div className="alert-suggestion">
                      <h4>建议操作:</h4>
                      <p>{alert.suggestion}</p>
                    </div>
                  )}
                </div>
                
                {!alert.resolved && (
                  <div className="alert-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      <FaCheck /> 标记为已处理
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleDismissAlert(alert.id)}
                    >
                      <FaTimes /> 忽略
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertSystem;