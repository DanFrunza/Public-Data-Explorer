require('dotenv').config();
const express = require('express');
const configureSecurity = require('./middleware/security');
const authModule = require('./modules/auth');
const cookieParser = require('cookie-parser');
const { ensureBucket } = require('./media/minio');

const app = express();
configureSecurity(app);
app.use(cookieParser());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Mount auth module under /api/auth for clear domain scoping
app.use('/api/auth', authModule.router);
// Users module (avatar upload + url)
app.use('/api/users', require('./modules/users/routes'));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend on ${port}`);
  // Ensure MinIO bucket exists in background
  ensureBucket().catch(() => {});
});
