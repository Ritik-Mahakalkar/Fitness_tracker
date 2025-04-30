import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import ProgressChart from './Components/progressChart';
import GoalTracker from './Components/GoalTracker';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useAuth = () => !!localStorage.getItem('token');

const ProtectedRoute = ({ children }) => {
  return useAuth() ? children : <Navigate to="/login" />;
};

const Alert = ({ message, type, clear }) => {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} position-fixed top-0 end-0 m-3 shadow`} role="alert" style={{ zIndex: 9999 }}>
      {message}
      <button type="button" className="btn-close float-end" onClick={clear}></button>
    </div>
  );
};

const Navbar = ({ darkMode, toggleDarkMode, onLogout }) => (
  <nav className={`navbar navbar-expand-lg navbar-${darkMode ? 'dark bg-dark' : 'light bg-light'} shadow-lg px-3`}>
    <Link className="navbar-brand fw-bold" to="/">Fitness</Link>
   
    <div className="collapse navbar-collapse">
      {useAuth() && (
        <div className="ms-auto d-flex align-items-center gap-3">
          <Link className="btn btn-outline-secondary" to="/add">Log Workout</Link>
          <Link className="btn btn-outline-secondary" to="/workouts">History</Link>
          <Link className="btn btn-outline-secondary" to="/goals">Goals</Link>
          <Link className="btn btn-outline-secondary" to="/progress">Progress</Link>

        </div>
      )}
      <div className="ms-auto d-flex align-items-center gap-3">
        {!useAuth() ? (
          <>
            <Link className="btn btn-outline-secondary" to="/login">Login</Link>
            <Link className="btn btn-outline-secondary" to="/register">Register</Link>
          </>
        ) : (
          <button className="btn btn-outline-secondary" onClick={() => {
            localStorage.removeItem('token');
            onLogout();
          }}>Logout</button>
        )}
      </div>
    </div>
  </nav>
);

const Register = ({ setAlert }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post('/register', form);
      setAlert('Registered! Now login.', 'success');
    } catch {
      setAlert('Registration failed', 'danger');
    }
  };

  return (
    <div className="container mt-5 register-form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control my-2" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="form-control my-2" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="form-control my-2" type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-secondary w-100 my-3">Register</button>
      </form>
    </div>
  );
};

const Login = ({ setAlert }) => {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/login', form);
      localStorage.setItem('token', res.data.token);
      setAlert('Login successful', 'success');
      window.location.href = '/workouts'; 
    } catch {
      setAlert('Login failed', 'danger');
    }
  };

  return (
    <div className="container mt-5  login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control my-2" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="form-control my-2" type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-secondary w-100 my-3">Login</button>
      </form>
    </div>
  );
};

const AddWorkout = ({ setAlert }) => {
  const [form, setForm] = useState({ exercise: '', type: '', sets: 0, reps: 0, weight: 0, duration: 0, calories: 0, notes: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post('/workouts', form);
      setAlert('Workout logged!', 'success');
      setForm({ exercise: '', type: '', sets: 0, reps: 0, weight: 0, duration: 0, calories: 0, notes: '' });
    } catch {
      setAlert('Error logging workout', 'danger');
    }
  };

  return (
    <div>
  
    <div className="container mt-5 workout-form">
      
      <form onSubmit={handleSubmit}>
        <input className="form-control my-2" placeholder="Type (e.g., strength)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
        <input className="form-control my-2" placeholder="Exercise" value={form.exercise} onChange={e => setForm({ ...form, exercise: e.target.value })} />
        <input className="form-control my-2" type="number" placeholder="Sets" value={form.sets} onChange={e => setForm({ ...form, sets: +e.target.value })} />
        <input className="form-control my-2" type="number" placeholder="Reps" value={form.reps} onChange={e => setForm({ ...form, reps: +e.target.value })} />
        <input className="form-control my-2" type="number" placeholder="Weight (kg)" value={form.weight} onChange={e => setForm({ ...form, weight: +e.target.value })} />
        <input className="form-control my-2" type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} />
        <input className="form-control my-2" type="number" placeholder="Calories burned" value={form.calories} onChange={e => setForm({ ...form, calories: +e.target.value })} />
        <textarea className="form-control my-2" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button className="btn btn-secondary w-100 my-3">Add Workout</button>
      </form>
    </div>
    </div>
  );
};

const WorkoutHistory = ({ setAlert }) => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    API.get('/workouts')
      .then(res => setWorkouts(res.data))
      .catch(() => setAlert('Error loading workouts', 'danger'));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Workout History</h2>
      {workouts.length === 0 ? <p>No workouts logged yet.</p> : (
        <div className="row">
          {workouts.map(w => (
            <div key={w._id} className="col-md-6 col-lg-4">
              <div className="card my-2 p-3 shadow-sm">
                <h5 className="mb-1">{w.exercise} <small className="text-muted">({w.type})</small></h5>
                <p className="mb-1">Sets: {w.sets}, Reps: {w.reps}, Weight: {w.weight}kg</p>
                <p className="mb-1">Duration: {w.duration} min, Calories: {w.calories}</p>
                <p className="mb-1 text-muted"><em>{w.notes}</em></p>
                <small className="text-muted">{new Date(w.date).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [alert, setAlertState] = useState({ message: '', type: '' });

  const setAlert = (msg, type = 'info') => {
    setAlertState({ message: msg, type });
    setTimeout(() => setAlertState({ message: '', type: '' }), 3000);
  };

  const logout = () => {
    setAlert('Logged out', 'info');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100'}>
        <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} onLogout={logout} />
        <Alert message={alert.message} type={alert.type} clear={() => setAlertState({ message: '', type: '' })} />
        <Routes>
          <Route path="/" element={<Navigate to="/workouts" />} />
          <Route path="/register" element={<Register setAlert={setAlert} />} />
          <Route path="/login" element={<Login setAlert={setAlert} />} />
          <Route path="/add" element={<ProtectedRoute><AddWorkout setAlert={setAlert} /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutHistory setAlert={setAlert} /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalTracker setAlert={setAlert} /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressChart setAlert={setAlert} /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
