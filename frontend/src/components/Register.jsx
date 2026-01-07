import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Auth.css";
import { useDispatch } from "react-redux";
import { setCredentials, setAuthStatus, setAuthError } from "../store/slices/authSlice";
import { post } from "../api/apiClient";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    country: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain at least 8 characters, including one letter and one number";
    }

    if(formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    dispatch(setAuthStatus("loading"));

    try {
      const data = await post("/api/auth/register", formData, { auth: false });
      // Backend returns { message, user, accessToken }
      dispatch(setCredentials({ token: data.accessToken || null, user: data.user }));
      dispatch(setAuthStatus("authenticated"));
      navigate('/dashboard');
    } catch (error) {
      const msg = error?.message || "Registration failed";
      setErrors({ server: msg });
      dispatch(setAuthError(msg));
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="register">
      <h1>Create account</h1>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <div className="form-group">
            <label htmlFor="first_name">First Name: </label>
            <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required/>
          </div>
          {errors.first_name && <span className="error">{errors.first_name}</span>}
        </fieldset>
        
        <fieldset>
          <div className="form-group">
            <label htmlFor="last_name">Last Name: </label>
            <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required/>
          </div>
          {errors.last_name && <span className="error">{errors.last_name}</span>}
        </fieldset>

        <fieldset>
          <div className="form-group">
            <label htmlFor="email">Email: </label>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
        </fieldset>
        
        <fieldset>
          <div className="form-group">
            <label htmlFor="password">Password: </label>
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
        </fieldset>

        <fieldset>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password: </label>
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required/>
          </div>
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </fieldset>

        <fieldset>
          <div className="form-group">
            <label htmlFor="country">Country: </label>
            <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required/>
          </div>
          {errors.country && <span className="error">{errors.country}</span>}
        </fieldset>

        <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      </form>
    </main>
  );
}

export default Register;