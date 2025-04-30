import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const GoalTracker = ({ setAlert }) => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    API.get('/goals')
      .then(res => setGoals(res.data))
      .catch(() => setAlert('Failed to load goals', 'danger'));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Fitness Goals</h2>
      {goals.length === 0 ? <p>No goals set.</p> : (
        <ul className="list-group">
          {goals.map(goal => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={goal._id}>
              {goal.name}
              <span className="badge bg-secondary">{goal.progress}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalTracker;
