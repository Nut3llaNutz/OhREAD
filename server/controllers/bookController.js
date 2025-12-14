const User = require('../models/User');

// @desc    Add book to user list
// @route   POST /api/books
// @access  Private
const addBook = async (req, res) => {
    const { title, author, description, coverImage, genre } = req.body;

    console.log("AddBook Request:", req.body); // Debug log

    if (!title) {
        return res.status(400).json({ message: 'Book title is required' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if book already exists in list
        const bookExists = user.savedBooks.find(book => book.title === title);
        if (bookExists) {
            return res.status(400).json({ message: 'Book already in your list' });
        }

        user.savedBooks.push({ title, author, description, coverImage, genre });
        await user.save();

        res.status(200).json(user.savedBooks);
    } catch (error) {
        console.error("Add Book Error:", error);
        // RETURN THE ACTUAL ERROR MESSAGE
        res.status(500).json({
            message: error.message || 'Unknown Server Error',
            details: error.toString()
        });
    }
};

// @desc    Get user's saved books
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user.savedBooks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Remove book from user list
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out the book to remove
        user.savedBooks = user.savedBooks.filter(
            (book) => book._id.toString() !== req.params.id
        );

        await user.save();
        res.status(200).json(user.savedBooks);
    } catch (error) {
        console.error("Delete Book Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { addBook, getBooks, deleteBook };
