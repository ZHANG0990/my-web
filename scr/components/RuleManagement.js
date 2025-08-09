import { useState, useEffect } from'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSave, FaCancel, FaEye } from'react-icons/fa';

const RuleManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    conditions: '',
    active: true
  });
  const [editingRule, setEditingRule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // 获取所有规则
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/rules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRules(response.data.data);
      setError('');
    } catch (err) {
      setError('获取规则失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (editingRule) {
      setEditingRule({
       ...editingRule,
        [name]: type === 'checkbox'? checked : value
      });
    } else {
      setNewRule({
       ...newRule,
        [name]: type === 'checkbox'? checked : value
      });
    }
  };

  const handleAddRule = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/rules`,
        newRule,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setRules([...rules, response.data.data]);
      setNewRule({
        name: '',
        description: '',
        conditions: '',
        active: true
      });
      setShowAddForm(false);
    } catch (err) {
      setError('添加规则失败，请重试');
      console.error(err);
    }
  };

  const handleUpdateRule = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/rules/${editingRule.id}`,
        editingRule,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setRules(rules.map(rule => 
        rule.id === editingRule.id? response.data.data : rule
      ));
      setEditingRule(null);
    } catch (err) {
      setError('更新规则失败，请重试');
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm('确定要删除这条规则吗？')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/rules/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setRules(rules.filter(rule => rule.id!== id));
      } catch (err) {
        setError('删除规则失败，请重试');
        console.error(err);
      }
    }
  };

  const handleTestRule = async (ruleId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/rules/test/${ruleId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      alert(`规则测试结果: ${response.data.message}`);
    } catch (err) {
      setError('测试规则失败，请重试');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">加载规则中...</div>;

  return (
    <div className="rule-management">
      <div className="header-actions">
        <h2>白流量过滤规则管理</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FaPlus /> {showAddForm? '取消' : '添加新规则'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="rule-form card">
          <h3>添加新规则</h3>
          <div className="form-group">
            <label>规则名称</label>
            <input
              type="text"
              name="name"
              value={newRule.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>规则描述</label>
            <textarea
              name="description"
              value={newRule.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label>过滤条件 (JSON格式)</label>
            <textarea
              name="conditions"
              value={newRule.conditions}
              onChange={handleInputChange}
              placeholder='例如: {"ip_range": "192.168.1.0/24", "user_agent": "Chrome"}'
              required
            ></textarea>
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={newRule.active}
              onChange={handleInputChange}
            />
            <label htmlFor="active">启用规则</label>
          </div>
          <div className="form-actions">
            <button 
              className="btn-primary" 
              onClick={handleAddRule}
            >
              <FaSave /> 保存
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setNewRule({
                  name: '',
                  description: '',
                  conditions: '',
                  active: true
                });
                setShowAddForm(false);
              }}
            >
              <FaCancel /> 取消
            </button>
          </div>
        </div>
      )}
      
      <div className="rules-list">
        <h3>现有规则</h3>
        {rules.length === 0? (
          <p className="no-data">暂无规则，请添加新规则</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>规则名称</th>
                <th>描述</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  {editingRule && editingRule.id === rule.id? (
                    <>
                      <td>{rule.id}</td>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editingRule.name}
                          onChange={handleInputChange}
                        />
                      </td>
                      <td>
                        <textarea
                          name="description"
                          value={editingRule.description}
                          onChange={handleInputChange}
                        ></textarea>
                      </td>
                      <td>
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id={`edit-active-${rule.id}`}
                            name="active"
                            checked={editingRule.active}
                            onChange={handleInputChange}
                          />
                          <label htmlFor={`edit-active-${rule.id}`}>
                            {editingRule.active? '启用' : '禁用'}
                          </label>
                        </div>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn-icon btn-success" 
                          onClick={handleUpdateRule}
                        >
                          <FaSave title="保存" />
                        </button>
                        <button 
                          className="btn-icon btn-secondary" 
                          onClick={() => setEditingRule(null)}
                        >
                          <FaCancel title="取消" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{rule.id}</td>
                      <td>{rule.name}</td>
                      <td>{rule.description}</td>
                      <td>
                        <span className={`status ${rule.active? 'active' : 'inactive'}`}>
                          {rule.active? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="btn-icon btn-info" 
                          onClick={() => handleTestRule(rule.id)}
                        >
                          <FaEye title="测试规则" />
                        </button>
                        <button 
                          className="btn-icon btn-primary" 
                          onClick={() => setEditingRule({...rule})}
                        >
                          <FaEdit title="编辑" />
                        </button>
                        <button 
                          className="btn-icon btn-danger" 
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <FaTrash title="删除" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RuleManagement;