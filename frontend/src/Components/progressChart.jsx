import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ProgressChart = ({ setAlert }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get('/progress')
      .then(res => setData(res.data))
      .catch(() => setAlert('Failed to load progress data', 'danger'));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Progress Over Time</h2>
      {data.length === 0 ? <p>No progress data available.</p> : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProgressChart;
