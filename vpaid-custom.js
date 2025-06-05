function getVPAIDAd() {
  let adContainer, video;
  let _events = {};

  return {
    handshakeVersion: function(version) {
      return '2.0';
    },

    initAd: function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      const adParams = JSON.parse(creativeData.AdParameters || '{}');
      const clickTrackers = adParams.clickTrackers || [];
      const videoFile = adParams.mediaFiles?.[0]?.uri || '';
      const clickThroughUrl = 'https://www.coca-colacompany.com/';

      video = environmentVars.videoSlot;
      adContainer = environmentVars.slot;

      // Set up ad container
      adContainer.style.position = 'relative';
      adContainer.style.width = '100%';
      adContainer.style.height = '100%';
      adContainer.style.overflow = 'hidden';
      adContainer.style.backgroundColor = 'black';

      // Inject video
      if (video && video.style) {
        video.src = videoFile;
        video.load();
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '20%';
        video.style.width = '80%';
        video.style.height = '80%';
        video.style.zIndex = '10';
      }

      // Side Banner
      const sideBanner = document.createElement('img');
      sideBanner.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      sideBanner.style.position = 'absolute';
      sideBanner.style.left = '0';
      sideBanner.style.top = '0';
      sideBanner.style.width = '20%';
      sideBanner.style.height = '100%';
      sideBanner.style.objectFit = 'cover';
      sideBanner.style.zIndex = '5';
      sideBanner.style.opacity = '0';
      sideBanner.style.transition = 'opacity 1s ease';

      sideBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=side';
        window.open(clickThroughUrl, '_blank');
      };

      // Bottom Banner
      const bottomBanner = document.createElement('img');
      bottomBanner.src = 'https://vast.thebesads.com/images/bottom-banner.jpg';
      bottomBanner.style.position = 'absolute';
      bottomBanner.style.bottom = '0';
      bottomBanner.style.left = '20%';
      bottomBanner.style.width = '80%';
      bottomBanner.style.height = '20%';
      bottomBanner.style.objectFit = 'cover';
      bottomBanner.style.zIndex = '5';
      bottomBanner.style.opacity = '0';
      bottomBanner.style.transition = 'opacity 1s ease';

      bottomBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=bottom';
        window.open(clickThroughUrl, '_blank');
      };

      adContainer.appendChild(sideBanner);
      adContainer.appendChild(bottomBanner);

      // Trigger fade-ins after layout
      setTimeout(() => {
        sideBanner.style.opacity = '1';
        bottomBanner.style.opacity = '1';
      }, 100);

      video.onended = () => this.stopAd();

      this._callEvent('AdLoaded');
    },

    startAd: function() {
      video?.play();
      this._callEvent('AdStarted');
    },

    stopAd: function() {
      this._callEvent('AdStopped');
    },

    // Required VPAID methods
    pauseAd: function() { video?.pause(); },
    resumeAd: function() { video?.play(); },
    expandAd: function() {},
    collapseAd: function() {},
    skipAd: function() {},
    resizeAd: function(width, height, viewMode) {},
    getAdLinear: function() { return true; },
    getAdExpanded: function() { return false; },
    getAdSkippableState: function() { return false; },
    getAdDuration: function() { return video?.duration || 30; },
    getAdRemainingTime: function() {
      return video ? video.duration - video.currentTime : 0;
    },
    getAdVolume: function() { return video?.volume || 1; },
    setAdVolume: function(val) { if (video) video.volume = val; },
    getAdWidth: function() { return video?.videoWidth || 640; },
    getAdHeight: function() { return video?.videoHeight || 360; },
    getAdIcons: function() { return false; },

    // Event handling
    subscribe: function(callback, eventName) {
      _events[eventName] = callback;
    },
    unsubscribe: function(eventName) {
      delete _events[eventName];
    },
    _callEvent: function(name) {
      if (typeof _events[name] === 'function') _events[name]();
    }
  };
}

window.getVPAIDAd = getVPAIDAd;
