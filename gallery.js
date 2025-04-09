let images = [];
let currentIndex = 0;
let slideTimer;

function startTimer() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    changeImage(1);
  }, 6000);
}

function loadImageDataFromHTML() {
  const containers = document.querySelectorAll('#image-slides div');
  containers.forEach(div => {
    images.push({
      src: div.getAttribute('data-src'),
      alt: div.getAttribute('data-alt'),
      caption: div.getAttribute('data-caption')
    });
  });
}

function showImage(index) {
  currentIndex = index;
  const img = images[index];
  const mainImage = document.getElementById('mainImage');
  mainImage.src = img.src;
  mainImage.alt = img.alt;
  document.getElementById('imageCaption').textContent = img.caption;

  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === index));

  const containers = document.querySelectorAll('.thumbnail-container');
  containers.forEach((container, i) => {
    container.style.borderColor = i === index ? '#0d2075' : '#ddd';
  });

  startTimer();
}

function changeImage(step) {
  let newIndex = (currentIndex + step + images.length) % images.length;
  showImage(newIndex);
}

function openConstrainedLightbox() {
  const lightbox = document.getElementById('constrained-lightbox');
  const img = images[currentIndex];

  document.getElementById('constrained-lightbox-image').src = img.src;
  document.getElementById('constrained-lightbox-image').alt = img.alt;
  document.getElementById('constrained-lightbox-caption').textContent = img.caption;

  lightbox.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeConstrainedLightbox() {
  document.getElementById('constrained-lightbox').style.display = 'none';
  document.body.style.overflow = 'auto';
}

function constrainedLightboxChangeImage(step) {
  changeImage(step);
  openConstrainedLightbox(); // Refresh content
}

function initializeGallery() {
  loadImageDataFromHTML();

  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  images.forEach((image, index) => {
    const container = document.createElement('div');
    container.className = 'thumbnail-container';
    container.onclick = () => showImage(index);

    const thumb = document.createElement('img');
    thumb.className = 'thumbnail';
    thumb.src = image.src;
    thumb.alt = image.alt;

    container.appendChild(thumb);
    thumbnailsContainer.appendChild(container);
  });

  showImage(0);
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGallery();

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeConstrainedLightbox();
    else if (event.key === 'ArrowLeft') changeImage(-1);
    else if (event.key === 'ArrowRight') changeImage(1);
  });
});
