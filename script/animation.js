document.addEventListener('DOMContentLoaded', () => {
  // Navigation click handling
  // Sticky elements have unreliable offsetTop, so scroll to top first
  // then read offsets from a clean state
  const dots = document.querySelectorAll('header nav .indicator-dot');
  const getScrollTargets = () => {
    const saved = window.scrollY;
    window.scrollTo({ top: 0 });

    const targets = {};
    stackArticles.forEach(a => {
      targets[a.id] = a.offsetTop - offsetOffset;
    });

    window.scrollTo({ top: saved });
    return targets;
  };

  let scrollTargets = getScrollTargets();
  window.addEventListener('resize', () => {
    scrollTargets = getScrollTargets();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href').substring(1);
      if (targetId in scrollTargets) {
        window.scrollTo({
          top: scrollTargets[targetId],
          behavior: 'smooth'
        });
      }
    });
  });

  // Why-we-started section: slide images in from sides when section comes into view
  const whyWeStarted = document.getElementById('why-we-started');
  if (whyWeStarted) {
    const rightImage = whyWeStarted.querySelector('p:first-of-type > img.right');
    const leftImage = whyWeStarted.querySelector('p:nth-of-type(2) > img.left');

    // Set initial positions (outside viewport) and opacity
    const angle = -60 * Math.PI / 180;
    const offsetX = 150 * Math.cos(angle);
    const offsetY = 150 * Math.sin(angle);

    if (leftImage) {
      leftImage.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out'; // Ease-out expo
    }
    if (rightImage) {
      rightImage.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out'; // Ease-out expo
    }

    // Observe when section comes into view (replayable)
    const whyWeStartedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate images to their final positions and fade in
          if (leftImage) {
            leftImage.style.transform = 'translateX(0)';
            leftImage.style.opacity = '1';
          }
          if (rightImage) {
            rightImage.style.transform = 'translate(0, 0)';
            rightImage.style.opacity = '0.5'; // Darker appearance
          }
        } else {
          // Reset to initial state when scrolled away
          if (leftImage) {
            leftImage.style.transform = 'translateX(-150px)';
            leftImage.style.opacity = '0';
          }
          if (rightImage) {
            rightImage.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            rightImage.style.opacity = '0';
          }
        }
      });
    }, {
      threshold: 0.3 // Trigger when 30% of section is visible
    });

    whyWeStartedObserver.observe(whyWeStarted);
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

  // Trigger core-strengths-cont animations when section comes into view
  const coreStrengthsCont = document.getElementById('core-strengths-cont');
  if (coreStrengthsCont) {
    const contAnimationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !coreStrengthsCont.classList.contains('animate')) {
          coreStrengthsCont.classList.add('animate');
          // Unobserve after triggering once
          contAnimationObserver.unobserve(coreStrengthsCont);
        }
      });
    }, {
      threshold: 0.2 // Trigger when 20% of section is visible
    });

    contAnimationObserver.observe(coreStrengthsCont);
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

    // Parallax effect for tomato image in process section
    const tomatoImg = process.querySelector('p:last-of-type img');

    if (tomatoImg) {
      const handleTomatoParallax = () => {
        const rect = process.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much the section has scrolled into view
        // When section top is at viewport bottom: scrollProgress = 0
        // When section bottom is at viewport top: scrollProgress = 1
        const scrollProgress = Math.max(0, Math.min(2,
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ));

        // Parallax factor: 0.6 means image moves at 60% of scroll speed
        // This creates the "lagging behind" effect
        const parallaxFactor = 0.6;
        const maxTranslate = rect.height * 1.5;
        const translateY = scrollProgress * maxTranslate * parallaxFactor;

        tomatoImg.style.transform = `translateY(${translateY}px)`;
      };

      // Throttle scroll event for performance
      let tomatoTicking = false;
      window.addEventListener('scroll', () => {
        if (!tomatoTicking) {
          window.requestAnimationFrame(() => {
            handleTomatoParallax();
            tomatoTicking = false;
          });
          tomatoTicking = true;
        }
      });

      // Initial call
      handleTomatoParallax();
    }
  }

  // Mouse-following tilt effect for featured-product mockup image
  const featuredProduct = document.getElementById('featured-product');
  if (featuredProduct) {
    const mockupImg = featuredProduct.querySelector('div.product > img');

    if (mockupImg) {
      const handleMouseMove = (e) => {
        const rect = mockupImg.getBoundingClientRect();
        const imgCenterX = rect.left + rect.width / 2;
        const imgCenterY = rect.top + rect.height / 2;

        // Calculate mouse position relative to image center
        const deltaX = e.clientX - imgCenterX;
        const deltaY = e.clientY - imgCenterY;

        // Convert to rotation angles (normalized by image dimensions)
        // Clamp the deltas to the image bounds to prevent extreme rotation
        const clampedDeltaX = Math.max(-rect.width / 2, Math.min(rect.width / 2, deltaX));
        const clampedDeltaY = Math.max(-rect.height / 2, Math.min(rect.height / 2, deltaY));

        const maxTilt = 15; // Maximum tilt in degrees
        const rotateY = (clampedDeltaX / rect.width) * maxTilt * 2;
        const rotateX = -(clampedDeltaY / rect.height) * maxTilt * 2;

        // Apply 3D transform
        mockupImg.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      };

      const handleMouseLeave = () => {
        // Reset to neutral position with smooth transition
        mockupImg.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      };

      // Add smooth transition
      mockupImg.style.transition = 'transform 0.1s ease-out';

      featuredProduct.addEventListener('mousemove', handleMouseMove);
      featuredProduct.addEventListener('mouseleave', handleMouseLeave);
    }
  }
});