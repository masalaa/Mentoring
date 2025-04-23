router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;
        const courses = await Course.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } }
            ]
        });
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: 'Error searching courses' });
    }
});