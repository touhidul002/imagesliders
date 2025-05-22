// Gallery system that supports multiple galleries on one page
class GalleryManager {
  constructor() {
    this.galleries = new Map();
    this.slideTimers = new Map();
  }

  // Initialize a single gallery
  initializeGallery(galleryId) {
    const gallerySection = document.querySelector(`[data-gallery="${galleryId}"]`);
    if (!gallerySection) return;

    const images = this.loadImageDataFromGallery(gallerySection);
    if (images.length === 0) return;

    this.galleries.set(galleryId, {
      images: images,
      currentIndex: 0,
      elements: {
        mainImage: gallerySection.querySelector('.main-image'),
        caption: gallerySection.querySelector('.caption'),
        thumbnailsContainer: gallerySection.querySelector('.thumbnails')
      }
    });

    this.createThumbnails(galleryId);
    this.showImage(galleryId, 0);
    this.startTimer(galleryId);
  }

  // Load image data from a specific gallery section
  loadImageDataFromGallery(gallerySection) {
    const images = [];
    const containers = gallerySection.querySelectorAll('.image-slides div');
    containers.forEach(div => {
      images.push({
        src: div.getAttribute('data-src'),
        alt: div.getAttribute('data-alt'),
        caption: div.getAttribute('data-caption')
      });
    });
    return images;
  }

  // Create thumbnails for a specific gallery
  createThumbnails(galleryId) {
    const gallery = this.galleries.get(galleryId);
    if (!gallery) return;

    const { images, elements } = gallery;
    elements.thumbnailsContainer.innerHTML = '';

    images.forEach((image, index) => {
      const container = document.createElement('div');
      container.className = 'thumbnail-container';
      container.onclick = () => this.showImage(galleryId, index);

      const thumb = document.createElement('img');
      thumb.className = 'thumbnail';
      thumb.src = image.src;
      thumb.alt = image.alt;

      container.appendChild(thumb);
      elements.thumbnailsContainer.appendChild(container);
    });
  }

  // Show a specific image in a gallery
  showImage(galleryId, index) {
    const gallery = this.galleries.get(galleryId);
    if (!gallery) return;

    const { images, elements } = gallery;
    gallery.currentIndex = index;

    const img = images[index];
    elements.mainImage.src = img.src;
    elements.mainImage.alt = img.alt;
    elements.caption.textContent = img.caption;

    // Update thumbnail active states
    const thumbnails = elements.thumbnailsContainer.querySelectorAll('.thumbnail');
    const containers = elements.thumbnailsContainer.querySelectorAll('.thumbnail-container');

    thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === index));
    containers.forEach((container, i) => {
      container.style.borderColor = i === index ? '#0d2075' : '#ddd';
    });

    this.startTimer(galleryId);
  }

  // Change image in a specific gallery
  changeImage(galleryId, step) {
    const gallery = this.galleries.get(galleryId);
    if (!gallery) return;

    const { images, currentIndex } = gallery;
    const newIndex = (currentIndex + step + images.length) % images.length;
    this.showImage(galleryId, newIndex);
  }

  // Timer management for auto-slideshow
  startTimer(galleryId) {
    this.clearTimer(galleryId);
    const timer = setInterval(() => {
      this.changeImage(galleryId, 1);
    }, 6000);
    this.slideTimers.set(galleryId, timer);
  }

  clearTimer(galleryId) {
    const timer = this.slideTimers.get(galleryId);
    if (timer) {
      clearInterval(timer);
      this.slideTimers.delete(galleryId);
    }
  }

  // Lightbox functionality
  openConstrainedLightbox(galleryId) {
    const gallery = this.galleries.get(galleryId);
    if (!gallery) return;

    const { images, currentIndex } = gallery;
    const img = images[currentIndex];

    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('constrained-lightbox');
    if (!lightbox) {
      lightbox = this.createLightbox();
    }

    document.getElementById('constrained-lightbox-image').src = img.src;
    document.getElementById('constrained-lightbox-image').alt = img.alt;
    document.getElementById('constrained-lightbox-caption').textContent = img.caption;

    // Store current gallery ID for lightbox navigation
    lightbox.setAttribute('data-current-gallery', galleryId);

    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  // Create lightbox HTML structure
  createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'constrained-lightbox';
    lightbox.innerHTML = `
      <div class="constrained-lightbox-content">
        <span class="constrained-lightbox-close" onclick="galleryManager.closeConstrainedLightbox()">&times;</span>
        <img id="constrained-lightbox-image" class="constrained-lightbox-image">
        <div id="constrained-lightbox-caption" class="constrained-lightbox-caption"></div>
        <button class="constrained-lightbox-prev" onclick="galleryManager.constrainedLightboxChangeImage(-1)">&#10094;</button>
        <button class="constrained-lightbox-next" onclick="galleryManager.constrainedLightboxChangeImage(1)">&#10095;</button>
      </div>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  closeConstrainedLightbox() {
    const lightbox = document.getElementById('constrained-lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  constrainedLightboxChangeImage(step) {
    const lightbox = document.getElementById('constrained-lightbox');
    const galleryId = lightbox.getAttribute('data-current-gallery');
    if (galleryId) {
      this.changeImage(galleryId, step);
      this.openConstrainedLightbox(galleryId); // Refresh content
    }
  }

  // Initialize all galleries on the page
  initializeAllGalleries() {
    const galleryElements = document.querySelectorAll('[data-gallery]');
    galleryElements.forEach(element => {
      const galleryId = element.getAttribute('data-gallery');
      this.initializeGallery(galleryId);
    });
  }
}

// Create global instance
const galleryManager = new GalleryManager();

// Global functions for backward compatibility and onclick handlers
function changeImage(galleryId, step) {
  galleryManager.changeImage(galleryId, step);
}

function openConstrainedLightbox(galleryId) {
  galleryManager.openConstrainedLightbox(galleryId);
}

function closeConstrainedLightbox() {
  galleryManager.closeConstrainedLightbox();
}

function constrainedLightboxChangeImage(step) {
  galleryManager.constrainedLightboxChangeImage(step);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  galleryManager.initializeAllGalleries();

  // Keyboard navigation
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeConstrainedLightbox();
    } else if (event.key === 'ArrowLeft') {
      const lightbox = document.getElementById('constrained-lightbox');
      if (lightbox && lightbox.style.display === 'block') {
        constrainedLightboxChangeImage(-1);
      }
    } else if (event.key === 'ArrowRight') {
      const lightbox = document.getElementById('constrained-lightbox');
      if (lightbox && lightbox.style.display === 'block') {
        constrainedLightboxChangeImage(1);
      }
    }
  });
});
