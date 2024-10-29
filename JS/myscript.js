
/* scrollin*/
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

AOS.init();

document.addEventListener('DOMContentLoaded', function() {
  var video = document.getElementById('video-back');
  
  // Ensure the video is muted to allow autoplay across devices
  video.muted = true;
  
  // Try to play the video when the page loads
  video.play().catch(error => {
    console.log('Autoplay blocked by the browser:', error);
  });

  // Optional: Attempt to play the video again on window resize
  window.addEventListener('resize', function() {
    video.play().catch(error => {
      console.log('Autoplay blocked by the browser on resize:', error);
    });
  });
});

