app.get('/api/courses/search', (req, res) => {
    const { term = '', category = '', price = '', sort = 'relevance' } = req.query;

    let results = courses;

    // Filter by search term
    if (term) {
        results = results.filter(course =>
            course.title.toLowerCase().includes(term.toLowerCase())
        );
    }

    // Filter by category
    if (category) {
        results = results.filter(course => course.category === category);
    }

    // Filter by price
    if (price === 'free') {
        results = results.filter(course => course.price === 0);
    } else if (price === 'paid') {
        results = results.filter(course => course.price > 0);
    }

    // Sorting
    switch (sort) {
        case 'price-low':
            results.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            results.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            results.sort((a, b) => b.rating - a.rating);
            break;
        case 'relevance':
        default:
            // No sort or basic relevance (original order or match rank)
            break;
    }

    res.json({ courses: results });
});
