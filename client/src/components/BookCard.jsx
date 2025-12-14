import { useState, useEffect, useRef } from 'react';

// --- UTILITY: BookCover API Fetcher ---
// Uses https://github.com/w3slley/bookcover-api
async function fetchCoverUrl(book) {
    // 1. Try by ISBN first (Most accurate)
    if (book.isbn) {
        try {
            const res = await fetch(`https://bookcover.longitood.com/bookcover/${book.isbn}`);
            if (res.ok) {
                const data = await res.json();
                if (data.url) return data.url;
            }
        } catch (e) {
            // Internal use, no need to log
        }
    }

    // 2. Try by Title + Author (Fallback)
    if (book.title && book.author) {
        try {
            const params = new URLSearchParams({
                book_title: book.title,
                author_name: book.author
            });
            const res = await fetch(`https://bookcover.longitood.com/bookcover?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.url) return data.url;
            }
        } catch (e) {
            // Internal use, no need to log
        }
    }

    return null;
}

const BookCard = ({ book, onAdd, index = 0 }) => {
    // State
    const [status, setStatus] = useState('loading'); // loading | loaded | error
    const [imageSrc, setImageSrc] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Derived Data
    const title = book?.title || 'Unknown Title';
    const author = book?.author || 'Unknown Author';
    const description = book?.description || 'No description available.';

    // Deterministic Color
    const getBgColor = () => {
        const colors = ['#1e293b', '#334155', '#475569', '#0f172a', '#1e1b4b', '#312e81', '#4c1d95', '#581c87', '#701a75', '#831843', '#881337', '#7f1d1d'];
        const hash = title.length + author.length + index;
        return colors[hash % colors.length];
    };
    const bgColor = getBgColor();

    // --- EFFECT: Image Loading Logic ---
    useEffect(() => {
        let isMounted = true;

        const loadCover = async () => {
            const url = await fetchCoverUrl(book);

            if (isMounted) {
                if (url) {
                    setImageSrc(url);
                    setStatus('loaded');
                } else {
                    setStatus('error');
                }
            }
        };

        // Delay slightly to prevent waterfall if many cards mount at once (optional optimization)
        const timer = setTimeout(loadCover, 100 * index);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [book, index]);

    return (
        <div
            className="book-card"
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '2/3',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                background: bgColor,
                cursor: 'default'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* CONTENT LAYER */}

            {/* 1. LOADED IMAGE */}
            {status === 'loaded' && imageSrc && (
                <img
                    src={imageSrc}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            )}

            {/* 2. LOADING STATE (Shimmer) */}
            {status === 'loading' && (
                <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(90deg, ${bgColor} 0%, #334155 50%, ${bgColor} 100%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                }} />
            )}

            {/* 3. ERROR / FALLBACK (Styled Text) */}
            {status === 'error' && (
                <div style={{
                    width: '100%', height: '100%', padding: '1.5rem',
                    display: 'flex', flexDirection: 'column',
                    background: `linear-gradient(135deg, ${bgColor} 80%, rgba(255,255,255,0.1) 100%)`,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <h3 style={{
                            color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '1.3rem',
                            textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>{title}</h3>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                        <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.5)', margin: '0 auto 0.5rem' }} />
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                            {author.toUpperCase()}
                        </p>
                    </div>
                </div>
            )}

            {/* HOVER OVERLAY */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isHovered ? 'auto' : 'none',
                textAlign: 'center'
            }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h4>
                <p style={{ color: 'var(--green-brand)', fontSize: '0.9rem', marginBottom: '1rem' }}>{author}</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.8rem', flex: 1, overflow: 'hidden' }}>{description}</p>

                <button
                    onClick={() => { if (!isAdded) { onAdd({ ...book, coverImage: imageSrc || book.coverImage }); setIsAdded(true); } }}
                    style={{
                        marginTop: '1rem', padding: '0.8rem', width: '100%',
                        background: isAdded ? 'transparent' : 'var(--green-brand)',
                        color: isAdded ? 'var(--green-brand)' : '#0f172a',
                        border: isAdded ? '1px solid var(--green-brand)' : 'none',
                        borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    {isAdded ? '✓ Added' : 'Add to List'}
                </button>
            </div>
        </div>
    );
};

export default BookCard;
