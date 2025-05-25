// Simplified gallery system - No hanging version
window.galleries = {};

function initGallery(galleryId) {
    console.log('Initializing gallery:', galleryId);

    const gallerySection = document.querySelector(`[data-gallery="${galleryId}"]`);
    if (!gallerySection) {
        console.error('Gallery section not found:', galleryId);
        return;
    }

    const imageSlides = gallerySection.querySelector('.image-slides');
    const mainImage = gallerySection.querySelector('.main-image');
    const caption = gallerySection.querySelector('.caption');
    const thumbnailsContainer = gallerySection.querySelector('.thumbnails');

    if (!imageSlides || !mainImage || !caption || !thumbnailsContainer) return;

    // Load images
    const images = [];
    const imageDivs = imageSlides.querySelectorAll('div[data-src]');
    imageDivs.forEach(div => {
        images.push({
            src: div.getAttribute('data-src'),
            alt: div.getAttribute('data-alt'),
            caption: div.getAttribute('data-caption')
        });
    });

    if (images.length === 0) return;

    // Store gallery data
    window.galleries[galleryId] = {
        images: images,
        currentIndex: 0,
        elements: { mainImage, caption, thumbnailsContainer },
        timer: null
    };

    // Create thumbnails with simple click handler
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = 'thumbnail-container';
        container.style.cursor = 'pointer';

        // Simple click handler - no complex logic
        container.addEventListener('click', function() {
            console.log('Thumbnail clicked:', index);
            const gallery = window.galleries[galleryId];
            if (gallery) {
                gallery.currentIndex = index;
                const img = gallery.images[index];
                gallery.elements.mainImage.src = img.src;
                gallery.elements.mainImage.alt = img.alt;
                gallery.elements.caption.textContent = img.caption;
                updateThumbnails(galleryId);
            }
        });

        const thumb = document.createElement('img');
        thumb.className = 'thumbnail';
        thumb.src = image.src;
        thumb.alt = image.alt;

        container.appendChild(thumb);
        thumbnailsContainer.appendChild(container);
    });

    // Show first image
    showFirstImage(galleryId);
}

function showFirstImage(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const image = gallery.images[0];
    gallery.elements.mainImage.src = image.src;
    gallery.elements.mainImage.alt = image.alt;
    gallery.elements.caption.textContent = image.caption;
    updateThumbnails(galleryId);
}

function updateThumbnails(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const containers = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail-container');
    containers.forEach((container, i) => {
        container.style.borderColor = i === gallery.currentIndex ? '#0d2075' : '#ddd';
    });
}

function showImage(galleryId, index, userTriggered = false) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    // Stop timer if user manually changed image
    if (userTriggered && gallery.timer) {
        clearInterval(gallery.timer);
        gallery.timer = null;
    }

    gallery.currentIndex = index;
    const image = gallery.images[index];

    gallery.elements.mainImage.src = image.src;
    gallery.elements.mainImage.alt = image.alt;
    gallery.elements.caption.textContent = image.caption;

    // Update thumbnails
    const thumbnails = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail');
    const containers = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail-container');

    thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    containers.forEach((container, i) => {
        container.style.borderColor = i === index ? '#0d2075' : '#ddd';
    });

    // Restart timer only if not user triggered
    if (!userTriggered) {
        startTimer(galleryId);
    }
}

function changeImage(galleryId, step, userTriggered = false) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const newIndex = (gallery.currentIndex + step + gallery.images.length) % gallery.images.length;
    showImage(galleryId, newIndex, userTriggered);
}

function startTimer(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    // Clear any existing timer
    if (gallery.timer) {
        clearInterval(gallery.timer);
        gallery.timer = null;
    }

    // Only start timer if gallery has more than 1 image
    if (gallery.images.length > 1) {
        gallery.timer = setInterval(() => {
            changeImage(galleryId, 1);
        }, 6000);
    }
}

function openConstrainedLightbox(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery || !gallery.images || gallery.images.length === 0) {
        console.error('Gallery not found or empty:', galleryId);
        return;
    }

    const image = gallery.images[gallery.currentIndex];
    if (!image) {
        console.error('Image not found at index:', gallery.currentIndex);
        return;
    }

    const lightbox = document.getElementById('constrained-lightbox');
    const lightboxImage = document.getElementById('constrained-lightbox-image');
    const lightboxCaption = document.getElementById('constrained-lightbox-caption');

    if (!lightbox || !lightboxImage || !lightboxCaption) {
        console.error('Lightbox elements not found');
        return;
    }

    // Stop any running timers when opening lightbox
    if (gallery.timer) {
        clearInterval(gallery.timer);
        gallery.timer = null;
    }

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.caption;

    lightbox.setAttribute('data-current-gallery', galleryId);
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeConstrainedLightbox() {
    const lightbox = document.getElementById('constrained-lightbox');
    if (!lightbox) return;

    const galleryId = lightbox.getAttribute('data-current-gallery');

    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Restart timer for the gallery when closing lightbox
    if (galleryId) {
        startTimer(galleryId);
    }
}

function constrainedLightboxChangeImage(step) {
    if (window.debugMode) console.log('Lightbox change image:', step);

    const lightbox = document.getElementById('constrained-lightbox');
    if (!lightbox) {
        console.error('Lightbox not found');
        return;
    }

    const galleryId = lightbox.getAttribute('data-current-gallery');
    if (!galleryId) {
        console.error('No gallery ID found');
        return;
    }

    const gallery = window.galleries[galleryId];
    if (!gallery || !gallery.images || gallery.images.length === 0) {
        console.error('Gallery not found or empty:', galleryId);
        return;
    }

    // Calculate new index safely
    const currentIndex = gallery.currentIndex || 0;
    const newIndex = (currentIndex + step + gallery.images.length) % gallery.images.length;

    if (window.debugMode) console.log('Changing from index', currentIndex, 'to', newIndex);

    // Update gallery current index
    gallery.currentIndex = newIndex;

    // Get the new image
    const image = gallery.images[newIndex];
    if (!image) {
        console.error('Image not found at index:', newIndex);
        return;
    }

    // Update lightbox image directly (don't call showImage to avoid conflicts)
    const lightboxImage = document.getElementById('constrained-lightbox-image');
    const lightboxCaption = document.getElementById('constrained-lightbox-caption');

    if (lightboxImage && lightboxCaption) {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = image.caption;
    }

    // Update the main gallery image in background (without triggering timer)
    if (gallery.elements && gallery.elements.mainImage) {
        gallery.elements.mainImage.src = image.src;
        gallery.elements.mainImage.alt = image.alt;
        if (gallery.elements.caption) {
            gallery.elements.caption.textContent = image.caption;
        }

        // Update thumbnails
        const thumbnails = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail');
        const containers = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail-container');

        thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === newIndex));
        containers.forEach((container, i) => {
            container.style.borderColor = i === newIndex ? '#0d2075' : '#ddd';
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all galleries
    document.querySelectorAll('[data-gallery]').forEach(element => {
        const galleryId = element.getAttribute('data-gallery');
        initGallery(galleryId);
    });

    // Lightbox event listeners - with error checking
    const closeBtn = document.querySelector('.constrained-lightbox-close');
    const prevBtn = document.querySelector('.constrained-lightbox-prev');
    const nextBtn = document.querySelector('.constrained-lightbox-next');
    const lightbox = document.getElementById('constrained-lightbox');

    if (closeBtn) closeBtn.onclick = closeConstrainedLightbox;
    if (prevBtn) prevBtn.onclick = () => constrainedLightboxChangeImage(-1);
    if (nextBtn) nextBtn.onclick = () => constrainedLightboxChangeImage(1);

    // Click outside lightbox to close
    if (lightbox) {
        lightbox.onclick = function(event) {
            if (event.target === lightbox) {
                closeConstrainedLightbox();
            }
        };
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        const lightbox = document.getElementById('constrained-lightbox');
        if (lightbox && lightbox.style.display === 'block') {
            if (event.key === 'Escape') closeConstrainedLightbox();
            else if (event.key === 'ArrowLeft') constrainedLightboxChangeImage(-1);
            else if (event.key === 'ArrowRight') constrainedLightboxChangeImage(1);
        }
    });
});
