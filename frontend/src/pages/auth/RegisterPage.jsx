import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerOwner } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/apiError';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await registerOwner(form);
      toast.success('Registration successful. Please login.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Start building</p>
        <h1>Register owner</h1>
      </div>

      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} required maxLength={100} />
      </label>

      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>

      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="muted">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}

export default RegisterPage;
