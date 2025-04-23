router.get('/search', async (req, res) => {
    try {
        const { term } = req.query;
        
        if (!term) {
            return res.status(400).json({ message: 'Search term is required' });
        }

        const courses = await Course.find(
            { $text: { $search: term } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .populate('mentor', 'name');

        res.json({ success: true, courses });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});