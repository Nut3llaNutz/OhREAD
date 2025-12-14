import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Footer from '../components/Footer';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const { login, register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            navigate('/features');
        }
        // Set mode based on URL
        setIsLogin(location.pathname === '/login');
    }, [user, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            navigate('/features');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="snap-container">
            {/* SECTION 1: MAIN AUTH FORM */}
            <section className="snap-section aurora-bg">
                <div className="glass-panel auth-panel">
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--navy-brand)' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {!isLogin && (
                            <input
                                type="text"
                                placeholder="Name"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <Link to={isLogin ? '/register' : '/login'} style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </Link>
                    </p>
                </div>
            </section>

            {/* SECTION 2: FOOTER */}
            <section className="snap-section" style={{ height: 'auto', minHeight: 'auto', alignItems: 'stretch' }}>
                <Footer />
            </section>
        </div>
    );
};

export default AuthPage;
