import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';

const demoAccounts = [
  { label: 'Owner demo', email: 'owner@demo.restrobuild.test', password: 'DemoPass123' },
  { label: 'Kitchen demo', email: 'kitchen@demo.restrobuild.test', password: 'DemoPass123' },
  { label: 'Waiter demo', email: 'waiter@demo.restrobuild.test', password: 'DemoPass123' },
];

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function fillDemoAccount(account) {
    setForm({ email: account.email, password: account.password });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const auth = await signIn(form);
      toast.success('Login successful.');
      if (auth.role === 'ROLE_KITCHEN') {
        navigate('/kitchen/pending', { replace: true });
      } else if (auth.role === 'ROLE_WAITER') {
        navigate('/waiter/ready', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
      </div>

      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>

      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>

      <section className="demo-login-panel" aria-label="Demo accounts">
        <span>Demo accounts</span>
        <div>
          {demoAccounts.map((account) => (
            <button className="ghost-button inline" key={account.email} type="button" onClick={() => fillDemoAccount(account)}>
              {account.label}
            </button>
          ))}
        </div>
      </section>

      <p className="muted">
        New owner? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}

export default LoginPage;
