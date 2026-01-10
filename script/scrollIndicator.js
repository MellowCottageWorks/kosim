// Scroll indicator active state management
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('article[id]');
  const dots = document.querySelectorAll('header nav .indicator-dot');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        dots.forEach(dot => {
          dot.classList.remove('active');
          if (dot.getAttribute('href') === `#${sectionId}`) {
            dot.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Smooth scroll behavior for navigation clicks
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
