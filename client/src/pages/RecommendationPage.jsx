import { useState, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import BookCard from '../components/BookCard';
import { API_URL } from '../config';

const RecommendationPage = () => {
    const { user } = useContext(AuthContext);

    // State
    const [preferences, setPreferences] = useState({ genre: '', mood: '', other: '' });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resultsRef = useRef(null);

    const genres = ['Sci-Fi', 'Mystery', 'Romance', 'Fantasy', 'Non-Fiction', 'Thriller', 'Historical'];
    const moods = ['Happy', 'Melancholic', 'Inspiring', 'Scary', 'Thought-provoking'];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults([]);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(`${API_URL}/ai/recommend`, preferences, config);

            // Robust data handling
            const data = Array.isArray(res.data) ? res.data : [];
            // Filter out obviously bad data
            const validData = data.filter(b => b.title && b.author);

            setResults(validData);

            // Auto-scroll logic
            setTimeout(() => {
                if (resultsRef.current && validData.length > 0) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get recommendations.');
        } finally {
            setLoading(false);
        }
    };

    const addToList = async (book) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Ensure we send a valid object, stripping nulls if needed or backend handles it
            const payload = { ...book }; // backend or BookCard logic handles cover usually, but simple payload is safe
            await axios.post(`${API_URL}/books`, payload, config);
        } catch (error) {
            const msg = error.response?.data?.message || 'Error adding book';
            if (msg.includes('already')) alert('Already in your library!');
            else alert(msg);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh' }}>
            <h1 className="fade-in" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '3rem', color: 'var(--navy-brand)' }}>
                Find Your Next Read
            </h1>
            <p className="fade-in" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Tell us what you're looking for, and we'll curate a collection.
            </p>

            {/* FORM */}
            <div className="glass-panel fade-in" style={{ maxWidth: '800px', margin: '0 auto 4rem auto', padding: '2.5rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Genre */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--navy-brand)' }}>Genre</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {genres.map(g => (
                                <button
                                    key={g} type="button"
                                    onClick={() => setPreferences({ ...preferences, genre: g })}
                                    style={{
                                        padding: '0.6rem 1.2rem', borderRadius: '20px',
                                        background: preferences.genre === g ? 'var(--green-brand)' : '#e2e8f0',
                                        color: preferences.genre === g ? '#fff' : '#64748b',
                                        border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--navy-brand)' }}>Mood</label>
                        <select
                            className="input-field"
                            value={preferences.mood}
                            onChange={(e) => setPreferences({ ...preferences, mood: e.target.value })}
                            style={{ width: '100%', padding: '0.8rem' }}
                        >
                            <option value="">Select a mood...</option>
                            {moods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Other */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: 'var(--navy-brand)' }}>Specifics</label>
                        <input
                            type="text" className="input-field"
                            placeholder="e.g. Set in the 1920s, strong female lead..."
                            value={preferences.other}
                            onChange={(e) => setPreferences({ ...preferences, other: e.target.value })}
                            style={{ width: '100%', padding: '0.8rem' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', fontSize: '1.1rem' }}>
                        {loading ? 'Curating...' : 'Get Recommendations'}
                    </button>
                </form>
                {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</div>}
            </div>

            {/* RESULTS */}
            {results.length > 0 && (
                <div ref={resultsRef} className="fade-in">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--navy-brand)' }}>Recommended for You</h2>
                    <div className="book-grid" style={{ padding: '0 0.5rem' }}>
                        {results.map((book, idx) => (
                            <BookCard key={idx} index={idx} book={book} onAdd={addToList} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationPage;
