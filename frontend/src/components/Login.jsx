import React, { useState } from "react";
import "../css/Auth.css";
import { Link, useNavigate } from "react-router-dom";
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
      // Backend returns { message, user, accessToken }
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
    <main className="register">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <div className="form-group">
            <label htmlFor="email">Email: </label>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
        </fieldset>
        <fieldset>
          <div className="form-group">
            <label htmlFor="password">Password: </label>
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </fieldset>
        <Link id="register-link" to="/register">You don't have an account? Register</Link>
        {errors.server && <span className="error">{errors.server}</span>}
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </main>
  );
};

export default Login;