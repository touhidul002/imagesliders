// Minimal test gallery - No hanging
window.galleries = {};

function initGallery(galleryId) {
    console.log('Init gallery:', galleryId);
    
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
        elements: { mainImage, caption, thumbnailsContainer }
    };

    // Create thumbnails
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = 'thumbnail-container';
        container.style.cursor = 'pointer';
        
        // Simple click - no complex functions
        container.onclick = function() {
            console.log('Clicked thumbnail:', index);
            const gallery = window.galleries[galleryId];
            if (gallery) {
                gallery.currentIndex = index;
                gallery.elements.mainImage.src = gallery.images[index].src;
                gallery.elements.mainImage.alt = gallery.images[index].alt;
                gallery.elements.caption.textContent = gallery.images[index].caption;
                
                // Update borders
                const containers = gallery.elements.thumbnailsContainer.querySelectorAll('.thumbnail-container');
                containers.forEach((c, i) => {
                    c.style.borderColor = i === index ? '#0d2075' : '#ddd';
                });
            }
        };

        const thumb = document.createElement('img');
        thumb.className = 'thumbnail';
        thumb.src = image.src;
        thumb.alt = image.alt;

        container.appendChild(thumb);
        thumbnailsContainer.appendChild(container);
    });

    // Show first image
    const firstImage = images[0];
    mainImage.src = firstImage.src;
    mainImage.alt = firstImage.alt;
    caption.textContent = firstImage.caption;
    
    // Set first thumbnail border
    const firstContainer = thumbnailsContainer.querySelector('.thumbnail-container');
    if (firstContainer) {
        firstContainer.style.borderColor = '#0d2075';
    }
}

// Simple lightbox
function openConstrainedLightbox(galleryId) {
    console.log('Opening lightbox for:', galleryId);
    const gallery = window.galleries[galleryId];
    if (!gallery) return;

    const image = gallery.images[gallery.currentIndex];
    const lightbox = document.getElementById('constrained-lightbox');
    const lightboxImage = document.getElementById('constrained-lightbox-image');
    const lightboxCaption = document.getElementById('constrained-lightbox-caption');

    if (lightbox && lightboxImage && lightboxCaption) {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = image.caption;
        lightbox.setAttribute('data-current-gallery', galleryId);
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeConstrainedLightbox() {
    const lightbox = document.getElementById('constrained-lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing galleries...');
    
    document.querySelectorAll('[data-gallery]').forEach(element => {
        const galleryId = element.getAttribute('data-gallery');
        initGallery(galleryId);
    });

    // Simple lightbox events
    const closeBtn = document.querySelector('.constrained-lightbox-close');
    if (closeBtn) {
        closeBtn.onclick = closeConstrainedLightbox;
    }
    
    const lightbox = document.getElementById('constrained-lightbox');
    if (lightbox) {
        lightbox.onclick = function(event) {
            if (event.target === lightbox) {
                closeConstrainedLightbox();
            }
        };
    }
});
