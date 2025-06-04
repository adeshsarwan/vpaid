
function VpaidAd() {
  var slot, videoSlot, callbacks = {};

  this.handshakeVersion = function(version) {
    return '2.0';
  };

  this.initAd = function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    slot = environmentVars.slot;

    // Clear previous content
    slot.innerHTML = '';

    // Style container
    slot.style.position = 'relative';
    slot.style.width = '100%';
    slot.style.height = '100%';
    slot.style.backgroundColor = '#000';

    // Add background image
    var bg = document.createElement('img');
    bg.src = 'https://via.placeholder.com/640x360?text=Brand+Image';
    bg.style.position = 'absolute';
    bg.style.top = '0';
    bg.style.left = '0';
    bg.style.width = '100%';
    bg.style.height = '100%';
    bg.style.objectFit = 'cover';
    slot.appendChild(bg);

    // Add video container
    var videoContainer = document.createElement('video');
    videoContainer.src = 'https://www.w3schools.com/html/mov_bbb.mp4'; // replace with actual video
    videoContainer.style.position = 'absolute';
    videoContainer.style.top = '20px';
    videoContainer.style.right = '20px';
    videoContainer.style.width = '300px';
    videoContainer.style.height = '170px';
    videoContainer.controls = true;
    videoContainer.autoplay = true;
    slot.appendChild(videoContainer);

    // CTA Button
    var cta = document.createElement('a');
    cta.href = 'https://example.com';
    cta.target = '_blank';
    cta.textContent = 'Learn More';
    cta.style.position = 'absolute';
    cta.style.bottom = '20px';
    cta.style.left = '20px';
    cta.style.padding = '10px 20px';
    cta.style.background = 'white';
    cta.style.color = 'black';
    cta.style.fontSize = '16px';
    cta.style.textDecoration = 'none';
    slot.appendChild(cta);

    if (callbacks['AdLoaded']) callbacks['AdLoaded']();
    if (callbacks['AdStarted']) callbacks['AdStarted']();
  };

  this.startAd = function() {};
  this.stopAd = function() { if (callbacks['AdStopped']) callbacks['AdStopped'](); };
  this.pauseAd = function() { if (callbacks['AdPaused']) callbacks['AdPaused'](); };
  this.resumeAd = function() { if (callbacks['AdPlaying']) callbacks['AdPlaying'](); };
  this.expandAd = function() {};
  this.collapseAd = function() {};
  this.skipAd = function() {};

  this.setAdVolume = function(val) {};
  this.getAdVolume = function() { return 1; };

  this.getAdLinear = function() { return true; };
  this.getAdWidth = function() { return 640; };
  this.getAdHeight = function() { return 360; };
  this.getAdExpanded = function() { return false; };
  this.getAdSkippableState = function() { return false; };
  this.getAdRemainingTime = function() { return 30; };
  this.getAdDuration = function() { return 30; };
  this.getAdCompanions = function() { return ''; };
  this.getAdIcons = function() { return false; };

  this.subscribe = function(callback, event) {
    callbacks[event] = callback;
  };

  this.unsubscribe = function(event) {
    delete callbacks[event];
  };
}

window.getVPAIDAd = function() {
  return new VpaidAd();
};
