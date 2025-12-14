import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '2rem 1rem',
            background: '#fff',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
        }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.png" alt="Oh!READ" style={{ height: '40px', opacity: 0.8 }} />

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Home</Link>
                    <Link to="/recommend" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recommendations</Link>
                    <Link to="/features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Library</Link>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '1rem' }}>
                    &copy; {new Date().getFullYear()} Oh!READ. Built for the love of books.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
