const { GoogleGenAI } = require("@google/genai");

// Initialize the new SDK with the API Key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Get book recommendations
// @route   POST /api/ai/recommend
// @access  Private
const getRecommendations = async (req, res) => {
    const { genre, mood, existingBooks, preferences } = req.body;

    // 1. Context Construction
    let promptContext = "";
    if (typeof req.body.message === 'string') {
        promptContext = `User Request: "${req.body.message}"`;
    } else {
        promptContext = `
            Genre: ${genre || 'Any'}
            Mood: ${mood || 'Any'}
            Specific Preferences: ${preferences || 'None'}
            Books they already like: ${existingBooks || 'None'}
        `;
    }

    if (!promptContext) {
        return res.status(400).json({ message: 'Please provide preferences' });
    }

    try {
        // 2. The Prompt
        // Focus: Strict JSON, Popular books, OpenLibrary IDs
        const prompt = `
            Act as an elite literary curator. I need EXACTLY 12 book recommendations based on the following context:
            ${promptContext}

            CRITICAL INSTRUCTIONS:
            1. Return the response STRICTLY as a valid JSON array of objects.
            2. VIBE MATCH: The user loves books like "The Song of Achilles", "Normal People", "Dune", and "Atomic Habits".
            3. SELECTION CRITERIA: Prioritize "Modern Classics", "Goodreads Choice Award Winners", "NYT Bestsellers", and "Viral BookTok Hits".
            4. QUALITY OVER OBSCURITY: Unless asked for "niche", avoid obscure books. Give me the books that people are obsessed with.
            5. STRICTLY REAL ISBNs: You MUST provide a real, verifiable ISBN-13 for the specific book. Do NOT guess.
            
            Each object in the array MUST have these fields:
            - "title": (String) Book title
            - "author": (String) Author name
            - "description": (String) A compelling, unique hook (not a generic summary).
            - "genre": (String) Primary genre
            - "isbn": (String) Valid ISBN-13.
            
            Example:
            [
                { "title": "The Seven Husbands of Evelyn Hugo", "author": "Taylor Jenkins Reid", "description": "...", "genre": "Historical Fiction", "isbn": "9781501161933" }
            ]
        `;

        // 3. Generation
        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

        // 4. Parsing (No External Validation)
        // We trust the AI + Client-side Fallbacks to handle the rest.
        // This prevents rate limits and speed issues.
        let recommendations = [];
        try {
            recommendations = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI response");
        }

        // 5. Basic Normalization
        recommendations = recommendations.map(book => ({
            title: book.title || "Unknown Title",
            author: book.author || "Unknown Author",
            description: book.description || "",
            genre: book.genre || "General",
            isbn: book.isbn || "",
            imageId: book.imageId || null,
            olid: book.olid || null
        }));

        res.json(recommendations);

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ message: "AI Generation Failed", error: error.message });
    }
};

module.exports = { getRecommendations };
