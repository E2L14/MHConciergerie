document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) translateX(0)';
            }
        });
    }, observerOptions);

    // Observer tous les service-items
    document.querySelectorAll('.service-item').forEach(item => {
        item.style.opacity = '0';
        observer.observe(item);
    });
});