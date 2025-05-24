// Simple multi-gallery system
window.galleries = {};

function initGallery(galleryId) {
    const gallerySection = document.querySelector(`[data-gallery="${galleryId}"]`);
    if (!gallerySection) return;

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

    // Create thumbnails
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = 'thumbnail-container';
        container.onclick = () => showImage(galleryId, index);

        const thumb = document.createElement('img');
        thumb.className = 'thumbnail';
        thumb.src = image.src;
        thumb.alt = image.alt;

        container.appendChild(thumb);
        thumbnailsContainer.appendChild(container);
    });

    // Show first image
    showImage(galleryId, 0);
    startTimer(galleryId);
}

function showImage(galleryId, index) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

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

    startTimer(galleryId);
}

function changeImage(galleryId, step) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const newIndex = (gallery.currentIndex + step + gallery.images.length) % gallery.images.length;
    showImage(galleryId, newIndex);
}

function startTimer(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    if (gallery.timer) clearInterval(gallery.timer);
    gallery.timer = setInterval(() => {
        changeImage(galleryId, 1);
    }, 6000);
}

function openConstrainedLightbox(galleryId) {
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const image = gallery.images[gallery.currentIndex];
    const lightbox = document.getElementById('constrained-lightbox');
    const lightboxImage = document.getElementById('constrained-lightbox-image');
    const lightboxCaption = document.getElementById('constrained-lightbox-caption');

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.caption;

    lightbox.setAttribute('data-current-gallery', galleryId);
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeConstrainedLightbox() {
    const lightbox = document.getElementById('constrained-lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function constrainedLightboxChangeImage(step) {
    const lightbox = document.getElementById('constrained-lightbox');
    const galleryId = lightbox.getAttribute('data-current-gallery');
    if (galleryId) {
        changeImage(galleryId, step);
        openConstrainedLightbox(galleryId);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all galleries
    document.querySelectorAll('[data-gallery]').forEach(element => {
        const galleryId = element.getAttribute('data-gallery');
        initGallery(galleryId);
    });

    // Lightbox event listeners
    document.querySelector('.constrained-lightbox-close').onclick = closeConstrainedLightbox;
    document.querySelector('.constrained-lightbox-prev').onclick = () => constrainedLightboxChangeImage(-1);
    document.querySelector('.constrained-lightbox-next').onclick = () => constrainedLightboxChangeImage(1);

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeConstrainedLightbox();
        else if (event.key === 'ArrowLeft') constrainedLightboxChangeImage(-1);
        else if (event.key === 'ArrowRight') constrainedLightboxChangeImage(1);
    });
});
