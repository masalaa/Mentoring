router.post('/search', async (req, res) => {
    try {
        const { searchTerm } = req.body;

        // Ensure searchTerm is provided
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const courses = await Course.aggregate([
            {
                $match: {
                    $or: [
                        { "overview.title": { $regex: searchTerm, $options: 'i' } },
                        { "overview.description": { $regex: searchTerm, $options: 'i' } },
                        { "overview.category": { $regex: searchTerm, $options: 'i' } }
                    ]
                }
            },
            {
                $addFields: {
                    relevanceScore: {
                        $add: [
                            { $cond: [{ $regexMatch: { input: "$overview.title", regex: searchTerm, options: "i" } }, 10, 0] },
                            { $cond: [{ $regexMatch: { input: "$overview.description", regex: searchTerm, options: "i" } }, 5, 0] }
                        ]
                    }
                }
            },
            { $sort: { relevanceScore: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            success: true,
            courses,
            count: courses.length
        });

    } catch (error) {
        console.error('Search error:', error.message); // Log error message
        res.status(500).json({ 
            success: false, 
            message: 'Error searching courses' 
        });
    }
});