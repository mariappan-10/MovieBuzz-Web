import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    personName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.personName || !formData.email || !formData.phoneNumber || 
        !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!/^[0-9]+$/.test(formData.phoneNumber)) {
      return 'Phone number should contain only numbers';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const success = await register(formData);
    if (success) {
      setSuccess('Registration successful! Please login to continue.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Join MovieBuzz</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="personName">Full Name:</label>
            <input
              type="text"
              id="personName"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              pattern="[0-9]*"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;