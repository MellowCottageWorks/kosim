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

  // Parallax effect for hero section (text elements only)
  const hero = document.getElementById('hero');
  if (hero) {
    const h1 = hero.querySelector('h1');
    const strong = hero.querySelector('strong');
    const h1Sub = hero.querySelector('#h1-sub');
    const button = hero.querySelector('button.CTA');

    const pageLoadTime = Date.now();

    // Animation timing config (in ms)
    const animations = {
      h1: { start: 2000, duration: 600, from: -30, to: 0 },
      strong: { start: 1000, duration: 500, from: 0, to: 0 }, // Letters animate, strong container doesn't move
      h1Sub: { start: 2600, duration: 600, from: 30, to: 0 },
      button: { start: 3200, duration: 600, from: 30, to: 0 }
    };

    // Calculate current animation offset based on time elapsed
    const getAnimationOffset = (element, config, elapsed) => {
      if (elapsed < config.start) {
        // Animation hasn't started yet
        return config.from;
      } else if (elapsed < config.start + config.duration) {
        // Animation in progress - calculate current position
        const progress = (elapsed - config.start) / config.duration;
        // Use ease-out easing (matching CSS ease-out)
        const eased = 1 - Math.pow(1 - progress, 2);
        return config.from + (config.to - config.from) * eased;
      } else {
        // Animation complete
        return config.to;
      }
    };

    // Get current opacity based on animation state
    const getAnimationOpacity = (config, elapsed) => {
      if (elapsed < config.start) {
        return 0;
      } else if (elapsed < config.start + config.duration) {
        const progress = (elapsed - config.start) / config.duration;
        const eased = 1 - Math.pow(1 - progress, 2);
        return eased;
      } else {
        return 1;
      }
    };

    const handleHeroParallax = () => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;
      const elapsed = Date.now() - pageLoadTime;

      if (scrollY > 0 && scrollY < heroHeight) {
        // Calculate parallax offset
        const parallaxOffset = scrollY * -0.4;

        // Apply parallax + animation offset for each element
        if (h1) {
          const animOffset = getAnimationOffset(h1, animations.h1, elapsed);
          const opacity = getAnimationOpacity(animations.h1, elapsed);
          const totalOffset = parallaxOffset + animOffset;
          h1.style.cssText = `transform: translateY(${totalOffset}px) !important; opacity: ${opacity};`;
        }

        if (strong) {
          const animOffset = getAnimationOffset(strong, animations.strong, elapsed);
          const opacity = getAnimationOpacity(animations.strong, elapsed);
          const totalOffset = parallaxOffset + animOffset;
          strong.style.cssText = `transform: translateY(${totalOffset}px) !important; opacity: ${opacity};`;
        }

        if (h1Sub) {
          const animOffset = getAnimationOffset(h1Sub, animations.h1Sub, elapsed);
          const opacity = getAnimationOpacity(animations.h1Sub, elapsed);
          const totalOffset = parallaxOffset + animOffset;
          h1Sub.style.cssText = `transform: translateY(${totalOffset}px) !important; opacity: ${opacity};`;
        }

        if (button) {
          const animOffset = getAnimationOffset(button, animations.button, elapsed);
          const opacity = getAnimationOpacity(animations.button, elapsed);
          const totalOffset = parallaxOffset + animOffset;
          button.style.cssText = `transform: translateY(${totalOffset}px) !important; opacity: ${opacity};`;
        }
      } else if (scrollY === 0) {
        // Reset to let CSS animations work when at top
        if (h1) h1.style.cssText = '';
        if (strong) strong.style.cssText = '';
        if (h1Sub) h1Sub.style.cssText = '';
        if (button) button.style.cssText = '';
      }
    };

    window.addEventListener('scroll', handleHeroParallax);
    // Use requestAnimationFrame during initial animations
    const animationEndTime = 3800;
    const updateDuringAnimation = () => {
      handleHeroParallax();
      if (Date.now() - pageLoadTime < animationEndTime) {
        requestAnimationFrame(updateDuringAnimation);
      }
    };
    updateDuringAnimation();
  }

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

  // Trigger core-strengths animations when section comes into view
  const coreStrengths = document.getElementById('core-strengths');
  if (coreStrengths) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !coreStrengths.classList.contains('animate')) {
          coreStrengths.classList.add('animate');
          // Unobserve after triggering once
          animationObserver.unobserve(coreStrengths);
        }
      });
    }, {
      threshold: 0.2 // Trigger when 20% of section is visible
    });

    animationObserver.observe(coreStrengths);
  }

  // Trigger process animations when section comes into view
  const process = document.getElementById('process');
  if (process) {
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !process.classList.contains('animate')) {
          process.classList.add('animate');
          // Unobserve after triggering once
          processObserver.unobserve(process);
        }
      });
    }, {
      threshold: 0.2 // Trigger when 20% of section is visible
    });

    processObserver.observe(process);
  }
});