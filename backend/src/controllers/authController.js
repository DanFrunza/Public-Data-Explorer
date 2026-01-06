const { validateRegister } = require('../validation/authValidation');
const { createUser, findUserByEmail, verifyPassword } = require('../services/userService');

async function register(req, res) {
  try {
    const errors = validateRegister(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const { email, password, first_name, last_name, country } = req.body;
    const user = await createUser({ email, password, first_name, last_name, country });
    return res.status(201).json({ message: 'Account created', user });
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    console.error('register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login: async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

      const user = await findUserByEmail(email);
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const ok = await verifyPassword(user.password_hash, password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      // Return minimal user info; tokens will be added later
      const { id, email: uemail, first_name, last_name, country, created_at } = user;
      return res.json({ message: 'Login successful', user: { id, email: uemail, first_name, last_name, country, created_at } });
    } catch (err) {
      console.error('login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  },
};
