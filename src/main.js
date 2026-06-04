import './styles/main.scss';

// The design is a fixed 1512 × 4661 Figma artboard. We scale it to the
// viewport width (never up past 1:1) and size the stage to the scaled
// height so the page scrolls naturally.
const ART_W = 1512;
const ART_H = 4661;

const stage = document.querySelector('.stage');
const artboard = document.querySelector('.artboard');

function fit() {
  const scale = Math.min(1, window.innerWidth / ART_W);
  artboard.style.setProperty('--scale', scale);
  stage.style.height = `${ART_H * scale}px`;
}

fit();
window.addEventListener('resize', fit);

// Sign-up capture — wire to a real endpoint when one exists.
const form = document.getElementById('signup');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  // eslint-disable-next-line no-console
  console.log('Sign-up:', data);
  form.reset();
});
