const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected")).catch(err => console.error(err));

// User Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Workout Model
const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  exercise: String,
  sets: Number,
  reps: Number,
  weight: Number,
  duration: Number,
  calories: Number,
  notes: String,
  date: { type: Date, default: Date.now }
});
const Workout = mongoose.model('Workout', workoutSchema);

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Add Workout
app.post('/api/workouts', auth, async (req, res) => {
  try {
    const workout = new Workout({ ...req.body, userId: req.user.id });
    await workout.save();
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Workouts
app.get('/api/workouts', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Fitness Goals (dummy endpoint for demonstration)
app.get('/api/goals', auth, async (req, res) => {
  try {
    // Replace this with actual goal fetching logic, for now returning dummy data
    const goals = [
      { _id: '1', name: 'Lose 5kg', progress: 60 },
      { _id: '2', name: 'Run 5km', progress: 80 }
    ];
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Progress (dummy endpoint for demonstration)
app.get('/api/progress', auth, async (req, res) => {
  try {
    // Replace this with actual progress data fetching logic, for now returning dummy data
    const progressData = [
      { date: '2025-01-01', weight: 70 },
      { date: '2025-02-01', weight: 68 },
      { date: '2025-03-01', weight: 65 }
    ];
    res.json(progressData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
