import { useState, useEffect } from'react';
import axios from 'axios';
import { Bar, Line, Pie } from'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FaRefresh, FaFilter } from'react-icons/fa';

// 注册Chart.js组件
Chart.register(...registerables);

const TrafficAnalysis = () => {
  const [trafficData, setTrafficData] = useState({
    total: 0,
    white: 0,
    filtered: 0,
    malicious: 0,
    trends: [],
    sources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/traffic/analysis?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setTrafficData(response.data.data);
      setError('');
    } catch (err) {
      setError('获取流量分析数据失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, [timeRange]);

  // 准备图表数据
  const trendChartData = {
    labels: trafficData.trends.map(item => item.time),
    datasets: [
      {
        label: '总流量',
        data: trafficData.trends.map(item => item.total),
        borderColor: '#333',
        backgroundColor: 'rgba(51, 51, 51, 0.1)',
        fill: true
      },
      {
        label: '白流量',
        data: trafficData.trends.map(item => item.white),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true
      },
      {
        label: '过滤流量',
        data: trafficData.trends.map(item => item.filtered),
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: true
      },
      {
        label: '恶意流量',
        data: trafficData.trends.map(item => item.malicious),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true
      }
    ]
  };

  const sourceChartData = {
    labels: trafficData.sources.map(item => item.source),
    datasets: [
      {
        data: trafficData.sources.map(item => item.count),
        backgroundColor: [
          '#4CAF50', '#2196F3', '#FF9800', '#F44336', 
          '#9C27B0', '#00BCD4', '#795548', '#607D8B'
        ]
      }
    ]
  };

  const summaryChartData = {
    labels: ['白流量', '过滤流量', '恶意流量'],
    datasets: [
      {
        data: [trafficData.white, trafficData.filtered, trafficData.malicious],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
      }
    ]
  };

  if (loading) return <div className="loading">加载流量分析数据中...</div>;

  return (
    <div className="traffic-analysis">
      <div className="header-actions">
        <h2>流量分析</h2>
        <div className="controls">
          <div className="time-range-selector">
            <label>时间范围:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">1小时</option>
              <option value="24h">24小时</option>
              <option value="7d">7天</option>
              <option value="30d">30天</option>
            </select>
          </div>
          <button 
            className="btn-icon btn-secondary" 
            onClick={fetchTrafficData}
          >
            <FaRefresh title="刷新数据" />
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 统计摘要 */}
      <div className="stats-summary">
        <div className="stat-card">
          <h3>总流量</h3>
          <p className="stat-value">{trafficData.total.toLocaleString()}</p>
          <p className="stat-desc">总请求数</p>
        </div>
        <div className="stat-card">
          <h3>白流量</h3>
          <p className="stat-value" style={{ color: '#4CAF50' }}>
            {trafficData.white.toLocaleString()}
          </p>
          <p className="stat-desc">已识别的正常流量</p>
        </div>
        <div className="stat-card">
          <h3>过滤流量</h3>
          <p className="stat-value" style={{ color: '#FF9800' }}>
            {trafficData.filtered.toLocaleString()}
          </p>
          <p className="stat-desc">被过滤的可疑流量</p>
        </div>
        <div className="stat-card">
          <h3>恶意流量</h3>
          <p className="stat-value" style={{ color: '#F44336' }}>
            {trafficData.malicious.toLocaleString()}
          </p>
          <p className="stat-desc">确认的威胁流量</p>
        </div>
      </div>
      
      {/* 流量分布 */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>流量类型分布</h3>
          <div className="chart-wrapper">
            <Pie data={summaryChartData} />
          </div>
        </div>
        
        <div className="chart-card">
          <h3>流量来源分布</h3>
          <div className="chart-wrapper">
            <Pie data={sourceChartData} />
          </div>
        </div>
        
        <div className="chart-card full-width">
          <h3>流量趋势</h3>
          <div className="chart-wrapper">
            <Line data={trendChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalysis;
