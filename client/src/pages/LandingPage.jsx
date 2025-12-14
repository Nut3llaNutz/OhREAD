import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import Footer from '../components/Footer';
import { API_URL } from '../config';

const LandingPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Global 5s Delay for Carousel
    const [startImageLoading, setStartImageLoading] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setStartImageLoading(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Mock Data for Community Favorites - Expanded for "Infinite" Feel
    const trendingBooks = [
        { title: "The Song of Achilles", author: "Madeline Miller", genre: "Historical Fiction", isbn: "9780062060624", description: "Gods, kings, and immortal fame." },
        { title: "Circe", author: "Madeline Miller", genre: "Fantasy", isbn: "9780316556347", description: "A bold retelling of the goddess's story." },
        { title: "Normal People", author: "Sally Rooney", genre: "Romance", isbn: "9781984822178", description: "Connell and Marianne's complex connection." },
        { title: "The Silent Patient", author: "Alex Michaelides", genre: "Thriller", isbn: "9781250301697", description: "Why does she not speak?" },
        { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", isbn: "9780441013593", description: "He who controls the spice controls the universe." },
        { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", isbn: "9780735211292", description: "Tiny changes, remarkable results." },
        { title: "Project Hail Mary", author: "Andy Weir", genre: "Sci-Fi", isbn: "9780593135204", description: "Alone in space, ready to save the world." },
        { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", isbn: "9780525559474", description: "Between life and death there is a library." },
        { title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", description: "Big Brother is watching you." },
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classics", isbn: "9780743273565", description: "The American Dream in the Roaring Twenties." },
        { title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-Fiction", isbn: "9780062316097", description: "A brief history of humankind." },
        { title: "Educated", author: "Tara Westover", genre: "Memoir", isbn: "9780399590504", description: "A survivalist childhood." },
        { title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Fiction", isbn: "9780735219090", description: "Secrets of the marsh." },
        { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Psychology", isbn: "9780374533557", description: "How we make decisions." },
        { title: "Dark Matter", author: "Blake Crouch", genre: "Sci-Fi", isbn: "9781101904220", description: "Are you happy with your life?" }
    ];

    // Duplicate list to create a seamless scrolling buffer
    const infiniteBooks = [...trendingBooks, ...trendingBooks];

    // Real Add Handler
    const handleAddBook = async (book) => {
        if (!user) {
            navigate('/register');
            return;
        }

        try {
            // Check if book is already in library (simple client-side check if we had the list, 
            // but for now relying on backend or just firing the request)
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const bookPayload = {
                ...book,
                coverImage: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : ''
            };

            await axios.post(`${API_URL}/books`, bookPayload, config);
            // No navigation - BookCard component handles the "Added" visual state
        } catch (error) {
            console.error("Failed to add book", error);
            if (error.response && error.response.data && error.response.data.message === 'Book already in your list') {
                // BookCard doesn't know it failed, but usually for "Add" button it's fine 
                // to just show "Added" even if it was already there.
            }
        }
    };

    // --- Auto-Scroll Logic ---
    const featuresRef = useRef(null);
    const carouselRef = useRef(null);

    const useSmartScroll = (ref) => {
        const timerRef = useRef(null);

        const startTimer = () => {
            stopTimer(); // Ensure no duplicates
            timerRef.current = setInterval(() => {
                if (ref.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
                    // Check if scrollable
                    if (scrollWidth <= clientWidth) return;

                    const cardWidth = 300; // Approx jump
                    const max = scrollWidth - clientWidth;

                    // Loop back to start if near end
                    if (scrollLeft + 10 >= max) {
                        ref.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        ref.current.scrollTo({ left: scrollLeft + cardWidth, behavior: 'smooth' });
                    }
                }
            }, 3000);
        };

        const stopTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };

        useEffect(() => {
            startTimer();
            // Cleanup on unmount
            return stopTimer;
        }, []);

        // User Interaction handlers
        const handleInteraction = () => {
            // Reset timer: Stop, then Start again (so next tick is 5s from now)
            startTimer();
        };

        const handleStop = () => {
            stopTimer(); // Permanently stop if clicked? "stops sliding"
        };

        return {
            onScroll: handleInteraction, // Detects manual scroll
            onTouchStart: handleInteraction,
            onClick: handleStop // "when clicked on a book its stops sliding"
        };
    };

    const featuresScroll = useSmartScroll(featuresRef);
    const carouselScroll = useSmartScroll(carouselRef);

    return (
        <div className="snap-container">

            {/* SECTION 1: HERO - Now with Aurora Background */}
            <section className="snap-section aurora-bg fade-in">
                <div className="container" style={{ textAlign: 'center', zIndex: 10 }}>
                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 8vw, 6rem)', // Responsive font sizing
                        lineHeight: '1',
                        marginTop: '5rem',
                        marginBottom: '3rem',
                        color: '#fff',
                        textShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        letterSpacing: '-2px',
                        fontWeight: '700'
                    }}>
                        <span style={{ display: 'block', fontSize: '0.4em', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '400', marginBottom: '0.5rem', opacity: 0.9 }}>
                            Discover Your Next
                        </span>
                        FAVORITE BOOK
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'rgba(255,255,255,0.95)',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem auto',
                        fontWeight: '400',
                        lineHeight: '1.75',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Powered by <strong>Google Gemini AI</strong>. Tell us your mood, and we'll curate the perfect reading list for you.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            fontSize: '1.1rem',
                            padding: '1rem 2.5rem',
                            background: '#fff',
                            color: 'var(--navy-brand)',
                            borderRadius: '50px',
                            fontWeight: '700',
                            boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(255, 255, 255, 0.5)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255, 255, 255, 0.4)'; }}
                        >
                            Start Exploring
                        </Link>

                        <a href="#features" style={{
                            padding: '1rem 2.5rem',
                            fontWeight: '600',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderRadius: '50px',
                            backdropFilter: 'blur(4px)',
                            background: 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '0',
                    width: '100%',
                    textAlign: 'center',
                    opacity: 0.7,
                    color: '#fff',
                    animation: 'bounce 2.5s infinite',
                    fontSize: '0.9rem',
                    letterSpacing: '1px',
                    pointerEvents: 'none',
                    display: window.innerWidth < 768 ? 'none' : 'block' // Hide on mobile to clean up UI
                }}>
                    SCROLL TO EXPLORE
                </div>
            </section >

            {/* SECTION 2: FEATURES */}
            < section id="features" className="snap-section" >
                <div className="container" style={{ textAlign: 'center', maxWidth: '1000px' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--navy-brand)', marginBottom: '4rem' }}>
                        How Oh!READ Works
                    </h2>

                    <div className="features-grid"
                        ref={featuresRef}
                        {...featuresScroll}
                    >
                        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🎭</div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--navy-brand)' }}>Set the Vibe</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Choose your preferred genre and current mood. Specificity helps us find the perfect match.
                            </p>
                        </div>

                        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🧠</div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--navy-brand)' }}>AI Curation</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Powered by Google Gemini, our engine analyzes thousands of plots to find hidden gems.
                            </p>
                        </div>

                        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'left' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>📚</div>
                            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--navy-brand)' }}>Build Your Library</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Save your favorites instantly. Your personal reading list, ready whenever you are.
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* SECTION 3: CAROUSEL */}
            < section className="snap-section" style={{ background: 'linear-gradient(to top, rgba(108, 171, 118, 0.1), transparent)' }}>
                <div className="container" style={{ textAlign: 'center', width: '100%' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--navy-brand)', marginBottom: '1rem' }}>
                        Community Favorites
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>
                        What other users are reading right now.
                    </p>

                    {/* Infinite Carousel Loop */}
                    <div className="carousel-container" style={{ margin: '0 auto' }}
                        ref={carouselRef}
                        {...carouselScroll}
                    >
                        {infiniteBooks.map((book, index) => (
                            <div key={index} className="book-poster">
                                <BookCard book={book} onAdd={() => handleAddBook(book)} startLoading={startImageLoading} />
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                            Join & Build Your Library
                        </Link>
                    </div>
                </div>
            </section >

            {/* Footer attached to the end of scroll flow - Forced full width */}
            < section className="snap-section" style={{ height: 'auto', minHeight: 'auto', alignItems: 'stretch' }}>
                <Footer />
            </section >
        </div >
    );
};

export default LandingPage;
