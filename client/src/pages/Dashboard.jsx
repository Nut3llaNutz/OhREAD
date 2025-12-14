import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Footer from '../components/Footer';
import { API_URL } from '../config';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Global Image Delay State
    const [startImageLoading, setStartImageLoading] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const res = await axios.get(`${API_URL}/books`, config);
                setBooks(res.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBooks();
        }
    }, [user]);

    // Global 5 Second Timer
    useEffect(() => {
        const timer = setTimeout(() => {
            setStartImageLoading(true);
        }, 5000); // 5 Seconds Delay
        return () => clearTimeout(timer);
    }, []);

    const [deleteModal, setDeleteModal] = useState({ show: false, bookId: null, bookTitle: '' });

    const handleDeleteClick = (e, book) => {
        e.stopPropagation();
        setDeleteModal({ show: true, bookId: book._id, bookTitle: book.title });
    };

    const confirmDelete = async () => {
        if (!deleteModal.bookId) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_URL}/books/${deleteModal.bookId}`, config);
            setBooks(books.filter(b => b._id !== deleteModal.bookId));
            setDeleteModal({ show: false, bookId: null, bookTitle: '' });
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete book");
        }
    };

    return (
        <div style={{ display: 'block' }}>

            {/* Custom Delete Modal Overlay - kept absolute */}
            {deleteModal.show && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(35, 52, 94, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                    onClick={() => setDeleteModal({ show: false, bookId: null, bookTitle: '' })}
                >
                    <div
                        className="glass-panel"
                        style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', background: '#fff' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '1rem', color: 'var(--navy-brand)', fontSize: '1.5rem' }}>Remove Book?</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                            Are you sure you want to remove <strong>{deleteModal.bookTitle}</strong> from your library?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteModal({ show: false, bookId: null, bookTitle: '' })}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    background: '#f1f5f9',
                                    color: 'var(--text-secondary)',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Themed Hero Banner - Normal Flow */}
            <div className="aurora-bg" style={{ padding: '8rem 2rem 4rem', marginBottom: '3rem', textAlign: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>Welcome Back, {user?.name?.split(' ')[0]}!</h1>
                <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>Your personal library awaits.</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link to="/recommend" className="btn-primary" style={{ background: '#fff', color: 'var(--navy-brand)' }}>
                        + Get New Recommendations
                    </Link>
                </div>
            </div>

            {/* Book Grid - Normal Flow */}
            <div className="container" style={{ paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--navy-brand)' }}>My Reading List</h2>
                    {!startImageLoading && !loading && books.length > 0 && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Syncing library covers...</p>
                    )}
                </div>

                {loading ? (
                    <p>Loading your library...</p>
                ) : books.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Your list is empty</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                            Start by asking our AI for some personalized book suggestions!
                        </p>
                        <Link to="/recommend" className="btn-primary">
                            Ask Gemini
                        </Link>
                    </div>
                ) : (
                    <div className="book-grid">
                        {books.map((book, index) => (
                            <DashboardBookCard
                                key={book._id || index}
                                book={book}
                                onDeleteClick={handleDeleteClick}
                                startLoadingImages={startImageLoading}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

// Extracted Component for Reliable State Handling (With Lazy Self-Healing Logic & ISBN Support)
const DashboardBookCard = ({ book, onDeleteClick, startLoadingImages }) => {
    // Stage 0: Initial DB Image
    // Stage 1: Google Books Fetch (Healing)
    // Stage 2: Title Card (Final Fallback)
    const [imageStage, setImageStage] = useState(0);
    const [dynamicCover, setDynamicCover] = useState(null);
    const [isHealing, setIsHealing] = useState(false);
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Initial Source (DB) - Secure & Cleaned
    const getInitialSrc = () => {
        let src = book.coverImage;
        if (src && src.includes('google')) {
            src = src.replace('http://', 'https://').replace('&edge=curl', '').replace('&zoom=1', '&zoom=0');
        } else if (src) {
            src = src.replace('http://', 'https://');
        }
        return src;
    };

    const initialSrc = getInitialSrc();

    // Intersection Observer for Lazy Healing
    useEffect(() => {
        // Can optimize: only observe if we can't load initial or if delay passed
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) observer.unobserve(cardRef.current);
        };
    }, []);

    // Trigger Healing ONLY when enabled AND visible AND no initial image
    useEffect(() => {
        if (startLoadingImages && isVisible && !initialSrc && imageStage === 0) {
            setImageStage(1);
        }
    }, [startLoadingImages, isVisible, initialSrc, imageStage]);

    // Healing Function: Fetch fresh cover if DB link dies
    useEffect(() => {
        if (imageStage === 1 && startLoadingImages) {
            let isMounted = true;
            setIsHealing(true); // Start loading UI

            const healImage = async () => {
                try {
                    let data = null;

                    // Strategy A: Try ISBN first (Precision)
                    if (book.isbn) {
                        try {
                            const isbnRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`);
                            const isbnData = await isbnRes.json();
                            if (isbnData.items && isbnData.items.length > 0) {
                                data = isbnData;
                            }
                        } catch (e) {
                            console.warn("ISBN search failed, falling back to title");
                        }
                    }

                    // Strategy B: Title + Author (Fallback)
                    if (!data) {
                        const query = `${book.title} ${book.author}`;
                        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
                        data = await res.json();
                    }

                    if (isMounted && data?.items?.[0]?.volumeInfo?.imageLinks) {
                        const images = data.items[0].volumeInfo.imageLinks;
                        // Get best image and ensure HTTPS
                        let url = (images.extraLarge || images.large || images.medium || images.thumbnail || images.smallThumbnail || '').replace('http://', 'https://');
                        url = url.replace('&edge=curl', '').replace('&zoom=1', '&zoom=0');
                        setDynamicCover(url);
                    } else {
                        // No luck, go to final fallback
                        if (isMounted) setImageStage(2);
                    }
                } catch (err) {
                    if (isMounted) setImageStage(2);
                } finally {
                    if (isMounted) setIsHealing(false);
                }
            };
            healImage();
            return () => { isMounted = false; };
        }
    }, [imageStage, startLoadingImages, book.title, book.author, book.isbn]);

    // Initial Image Error Handler
    const handleError = () => {
        if (imageStage === 0) {
            setImageStage(1);
        } else if (imageStage === 1) {
            setImageStage(2);
        }
    };

    // Decide what to show
    let currentSrc = null;
    if (imageStage === 0) currentSrc = initialSrc;
    if (imageStage === 1) currentSrc = dynamicCover;

    return (
        <div
            ref={cardRef}
            className="glass-panel" style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
                const btn = e.currentTarget.querySelector('.remove-btn');
                if (btn) btn.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                const btn = e.currentTarget.querySelector('.remove-btn');
                if (btn) btn.style.opacity = '0';
            }}
        >
            {/* Remove Button */}
            <button
                className="remove-btn"
                onClick={(e) => onDeleteClick(e, book)}
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 20,
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                title="Remove from list"
            >
                ✕
            </button>

            <div style={{ width: '100%', aspectRatio: '2/3', position: 'relative' }}>
                {/* 
                    LOGIC:
                    1. If !startLoadingImages (Gloabl 5s wait) -> Show Shimmer
                    2. If isHealing (Fetching new cover) -> Show Shimmer
                    3. Else show Image
                */}
                {(!startLoadingImages || isHealing) ? (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite'
                    }} />
                ) : imageStage !== 2 && (currentSrc) ? (
                    <img
                        src={currentSrc}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={handleError}
                    />
                ) : (
                    /* Fallback Title Card */
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, var(--navy-brand), #1e293b)',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            color: '#fff',
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.2rem',
                            marginBottom: '0.5rem'
                        }}>
                            {book.title}
                        </h3>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.8rem',
                            fontStyle: 'italic'
                        }}>
                            by {book.author}
                        </p>
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                <p style={{ color: 'var(--green-brand)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{book.author}</p>
                <span style={{
                    display: 'inline-block',
                    background: 'rgba(108, 171, 118, 0.1)',
                    color: 'var(--green-brand)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    {book.genre}
                </span>
            </div>
        </div>
    );
};

export default Dashboard;
