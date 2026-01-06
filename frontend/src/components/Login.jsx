import React, { useState } from "react";
import "../css/Auth.css";

const Login = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const resp = await fetch(`${apiBase}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrors({ server: data.message || "Login failed" });
      } else {
        alert("Login successful!");
      }
    } catch (err) {
      setErrors({ server: "Network error, please try again." });
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
        {errors.server && <span className="error">{errors.server}</span>}
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </main>
  );
};

export default Login;