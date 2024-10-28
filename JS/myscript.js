
/* scrollin*/
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

AOS.init();

document.addEventListener('DOMContentLoaded', function() {
  var video = document.getElementById('video-back');
  video.play().catch(error => {
      // In alcuni casi, l’autoplay viene bloccato del tutto e può lanciare un errore.
      console.log('Autoplay bloccato dal browser:', error);
  });
});

