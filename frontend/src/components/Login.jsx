import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, setAuthStatus, setAuthError } from "../store/slices/authSlice";
import { post } from "../api/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    dispatch(setAuthStatus("loading"));
    try {
      const data = await post("/api/auth/login", formData, { auth: false });
      dispatch(setCredentials({ token: data.accessToken || null, user: data.user }));
      dispatch(setAuthStatus("authenticated"));
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.message || "Login failed";
      setErrors({ server: msg });
      dispatch(setAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-modern">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🔑 Login</div>
          <h1 className="hero-title">
            <span className="text-gradient">Sign in</span> to your account
          </h1>
          <p className="hero-desc">
            Access your dashboard and explore public data. Enter your credentials below.
          </p>
        </div>
      </section>
      {/* Login Card */}
      <section className="auth-section">
        <div className="auth-card">
          <form onSubmit={handleSubmit} noValidate>
            <fieldset>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              </div>
              {errors.email && <span className="error">{errors.email}</span>}
            </fieldset>
            <fieldset>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              </div>
              {errors.password && <span className="error">{errors.password}</span>}
            </fieldset>
            <Link id="register-link" to="/register">Don't have an account? Register</Link>
            {errors.server && <span className="error">{errors.server}</span>}
            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;