import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            padding: '0.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} className="hover-scale">
                <img src="/logo.png" alt="Oh!READ" style={{ height: '70px' }} />
            </Link>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        <Link to="/features" style={{ fontWeight: '500', color: 'var(--navy-brand)' }}>Library</Link>
                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            style={{
                                background: 'transparent',
                                color: '#ef4444',
                                fontWeight: '600',
                                border: '2px solid rgba(239, 68, 68, 0.2)',
                                padding: '0.6rem 1.25rem',
                                borderRadius: '2rem',
                                transition: 'all 0.2s ease'
                            }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ fontWeight: '500', color: 'var(--navy-brand)' }}>Login</Link>
                        <Link to="/register" className="btn-primary">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
