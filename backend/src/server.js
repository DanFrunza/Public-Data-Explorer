require('dotenv').config();
const express = require('express');
const configureSecurity = require('./middleware/security');
const authRoutes = require('./routes/auth');

const app = express();
configureSecurity(app);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend on ${port}`));
