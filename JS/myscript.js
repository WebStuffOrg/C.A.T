
/* scrollin*/
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

AOS.init();

document.addEventListener('DOMContentLoaded', function() {
  var video = document.getElementById('video-back');

  function playVideo() {
    video.play().catch(error => {
      console.log('Autoplay bloccato dal browser:', error);
    });
  }

  // Check if the screen is in responsive mode (< 768px) to autoplay the video
  if (window.innerWidth <= 768) {
    playVideo();
  }

  // Optional: Also listen for window resize to restart video if resizing below 768px
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      playVideo();
    }
  });
});
