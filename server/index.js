const express = require('express');
const cors = require('cors');
const { rateLimiter, securityHeaders, validateRequest } = require('./middleware/security');

const authRoutes = require('./routes/auth');
const biometricRoutes = require('./routes/biometric');
const scarfRoutes = require('./routes/scarf');
const entryRoutes = require('./routes/entry');
const exitRoutes = require('./routes/exit');
const dashboardRoutes = require('./routes/dashboard');
const systemRoutes = require('./routes/system');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(securityHeaders);
app.use(rateLimiter);
app.use(validateRequest);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/biometric', biometricRoutes);
app.use('/api/scarf', scarfRoutes);
app.use('/api/scarves', scarfRoutes);
app.use('/api/entry', entryRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/gates', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'BHAROSA Identity Verification Backend', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`\n🛕 BHAROSA Backend Server running on port ${PORT}`);
  console.log(`   Identity Verification Engine: ACTIVE`);
  console.log(`   Iris Biometric Engine: ACTIVE`);
  console.log(`   Scarf Lifecycle Manager: ACTIVE`);
  console.log(`   Aadhaar OTP Simulator: ACTIVE\n`);
});
