document.addEventListener('DOMContentLoaded', () => {
  // Scroll indicator active state management
  const sections = document.querySelectorAll('article[id]');
  const dots = document.querySelectorAll('header nav .indicator-dot');

  // Set first dot as active initially
  if (dots.length > 0) {
    dots[0].classList.add('active');
  }

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

  // Parallax effect for why-we-started section
  const whyWeStarted = document.getElementById('why-we-started');
  if (whyWeStarted) {
    const rightImage = whyWeStarted.querySelector('p:first-of-type > img.right');
    const leftImage = whyWeStarted.querySelector('p:nth-of-type(2) > img.left');

    const handleParallax = () => {
      const rect = whyWeStarted.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;

      // Calculate progress: -1 (top of section at bottom of viewport) to 1 (bottom of section at top of viewport)
      // When section is centered, progress = 0
      const sectionCenter = rect.top + sectionHeight / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = sectionCenter - viewportCenter;

      // Normalize: when centered = 0, normalize by half section height for smooth range
      const progress = distanceFromCenter / (sectionHeight / 2);

      // Left image: faster movement (coefficient 150)
      // Right image: slower movement (coefficient 75)
      // When progress = 0 (centered), both offsets = 0
      if (leftImage) {
        const leftOffset = progress * 150;
        leftImage.style.transform = `translateY(${leftOffset}px)`;
      }

      if (rightImage) {
        const rightOffset = progress * 50;
        // Image is rotated 50deg clockwise
        // To appear to move straight up, move at -50deg (counter-clockwise from vertical)
        const angle = 50 * Math.PI / 180; // Convert -50deg to radians
        const offsetX = rightOffset * Math.sin(angle); // Horizontal component
        const offsetY = rightOffset * Math.cos(angle); // Vertical component
        rightImage.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    };

    // Throttle scroll event for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleParallax();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial call
    handleParallax();
  }
});