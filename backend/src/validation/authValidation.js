function isValidEmail(email) {
  return typeof email === 'string' &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pw) {
  return typeof pw === 'string' &&
    pw.length >= 8 && pw.length <= 128 &&
    /[A-Za-z]/.test(pw) && /\d/.test(pw);
}

function isValidName(s) {
  return typeof s === 'string' && s.trim().length >= 1 && s.trim().length <= 100;
}

function isValidCountry(s) {
  return typeof s === 'string' && s.trim().length >= 1 && s.trim().length <= 100;
}

function validateRegister(payload) {
  const { email, password, first_name, last_name, country } = payload || {};
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Invalid email';
  if (!isValidPassword(password)) errors.password = 'Weak password: min 8 chars, include letters and digits';
  if (!isValidName(first_name)) errors.first_name = 'First name is required';
  if (!isValidName(last_name)) errors.last_name = 'Last name is required';
  if (!isValidCountry(country)) errors.country = 'Country is required';
  return errors;
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidCountry,
  validateRegister,
};
