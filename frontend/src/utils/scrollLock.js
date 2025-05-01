/**
 * Utility functions for locking/unlocking scroll on the body
 */

export const lockScroll = () => {
  // Get current scroll position
  const scrollY = window.scrollY;
  
  // Save the current scroll position and add styles to lock the body
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.dataset.scrollPosition = scrollY;
};

export const unlockScroll = () => {
  // Get saved scroll position
  const scrollY = document.body.dataset.scrollPosition || '0';
  
  // Remove the styles that lock the body
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  delete document.body.dataset.scrollPosition;
  
  // Scroll back to the saved position
  window.scrollTo(0, parseInt(scrollY));
};
