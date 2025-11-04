document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');
    const navLinks = menu.querySelectorAll('a');

    if (menuToggle && menu && iconOpen && iconClose) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            iconOpen.classList.toggle('hidden');
            iconClose.classList.toggle('hidden');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                iconOpen.classList.remove('hidden');
                iconClose.classList.add('hidden');
            });
        });
    }

    // --- 2. Hero Content "Click" Effect ---
    const heroContent = document.getElementById('hero-content');
    if (heroContent) {
        heroContent.addEventListener('mousedown', () => {
            heroContent.classList.add('hero-clicked');
        });
        heroContent.addEventListener('animationend', () => {
            heroContent.classList.remove('hero-clicked');
        });
    }

    // --- 3. Image Comparison Slider ---
    function initImageSliders() {
        document.querySelectorAll('.image-comparison-slider').forEach(slider => {
            const handle = slider.querySelector('.slider-handle');
            const beforeImage = slider.querySelector('.before-image');
            let isDragging = false;

            const startDrag = (e) => {
                isDragging = true;
                slider.classList.add('dragging');
                if (e.preventDefault) e.preventDefault();
            };

            const stopDrag = () => {
                isDragging = false;
                slider.classList.remove('dragging');
            };

            const onDrag = (e) => {
                if (!isDragging) return;
                
                if (e.preventDefault) e.preventDefault();

                const x = e.clientX || (e.touches && e.touches[0].clientX);
                if (x === undefined) return;
                
                const rect = slider.getBoundingClientRect();
                let offsetX = x - rect.left;
                let percentage = (offsetX / rect.width) * 100;

                if (percentage < 0) percentage = 0;
                if (percentage > 100) percentage = 100;

                handle.style.left = `${percentage}%`;
                beforeImage.style.width = `${percentage}%`;
            };

            // Mouse events
            handle.addEventListener('mousedown', startDrag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('mousemove', onDrag);

            // Touch events
            handle.addEventListener('touchstart', startDrag, { passive: false });
            document.addEventListener('touchend', stopDrag);
            document.addEventListener('touchmove', onDrag, { passive: false });
        });
    }
    initImageSliders();

    // --- 4. Particle Background (Nebula + Stars) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const maxStarRadius = 3.5;
        const minStarRadius = 1.5;

        // Utility function to parse RGB from CSS variable
        function hexToRgb() {
            const style = getComputedStyle(document.documentElement);
            const color = style.getPropertyValue('--color-particle').trim();

            if (color.startsWith('rgba')) {
                const parts = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                if (parts) {
                    return `${parts[1]}, ${parts[2]}, ${parts[3]}`;
                }
            }
            return '173, 216, 230'; // Default light blue
        }
        
        const particleRgbColor = hexToRgb();

        class Particle {
            constructor(x, y, radius, dx, dy, type = 'star') {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.dx = dx;
                this.dy = dy;
                this.type = type; // 'star' or 'nebula'
            }

            draw() {
                ctx.beginPath();
                let gradient;
                
                if (this.type === 'star') {
                    gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                    gradient.addColorStop(0, `rgba(${particleRgbColor}, 1.0)`);
                    gradient.addColorStop(0.7, `rgba(${particleRgbColor}, 0.5)`);
                    gradient.addColorStop(1, `rgba(${particleRgbColor}, 0)`);
                } else {
                    gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                    gradient.addColorStop(0, `rgba(${particleRgbColor}, 0.08)`);
                    gradient.addColorStop(1, `rgba(${particleRgbColor}, 0)`);
                }
                
                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }

            update() {
                // Wall collision (wrap around)
                if (this.x > canvas.width + this.radius) {
                    this.x = -this.radius;
                } else if (this.x < -this.radius) {
                    this.x = canvas.width + this.radius;
                }
                
                if (this.y > canvas.height + this.radius) {
                    this.y = -this.radius;
                } else if (this.y < -this.radius) {
                    this.y = canvas.height + this.radius;
                }

                this.x += this.dx;
                this.y += this.dy;

                this.draw();
            }
        }

        // --- Core Init and Animation Functions ---
        const initParticles = () => {
            particles = [];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const newStarCount = Math.floor((canvas.width * canvas.height) / 4500); 
            const newNebulaCount = 45;

            // 1. Create Nebula Particles
            for (let i = 0; i < newNebulaCount; i++) {
                const radius = Math.random() * 120 + 70;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const dx = (Math.random() - 0.5) * 0.07;
                const dy = (Math.random() - 0.5) * 0.07;
                particles.push(new Particle(x, y, radius, dx, dy, 'nebula'));
            }

            // 2. Create Star Particles
            for (let i = 0; i < newStarCount; i++) {
                const radius = Math.random() * (maxStarRadius - minStarRadius) + minStarRadius;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const dx = (Math.random() - 0.5) * 0.4;
                const dy = (Math.random() - 0.5) * 0.4;
                particles.push(new Particle(x, y, radius, dx, dy, 'star'));
            }
        }

        const animateParticles = () => {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height); 

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
        }
        
        // Start particle system
        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(initParticles, 100);
        });
    }

    // --- 5. Scroll to Top Button ---
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 6. Fade-in on Scroll ---
    const sections = document.querySelectorAll('.fade-in-section');
    if (sections.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // --- 7. Formspree Contact Form ---
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    const submitButton = document.getElementById("submit-button");

    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const data = new FormData(e.target);
            const originalButtonText = submitButton.innerHTML;
            
            submitButton.innerHTML = `Sending... <ion-icon name="paper-plane-outline" style="margin-left: 0.5rem; vertical-align: middle;"></ion-icon>`;
            submitButton.disabled = true;

            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    status.innerHTML = "Thanks for your message! I'll get back to you soon.";
                    status.className = 'success';
                    form.reset();
                } else {
                    const responseData = await response.json();
                    if (Object.hasOwn(responseData, 'errors')) {
                        status.innerHTML = responseData["errors"].map(error => error["message"]).join(", ");
                    } else {
                        status.innerHTML = "Oops! There was a problem submitting your form.";
                    }
                    status.className = 'error';
                }
            } catch (error) {
                status.innerHTML = "Oops! There was a problem and your message couldn't be sent.";
                status.className = 'error';
            } finally {
                // Restore button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Clear status message after 5 seconds
                setTimeout(() => {
                    status.innerHTML = '';
                    status.className = '';
                }, 5000);
            }
        });
    }

});