function getVPAIDAd() {
  let adContainer, video, clickThrough = '', clickTrackers = [], _volume = 1;
  let events = {}, quartileEventsFired = {25: false, 50: false, 75: false};

  function callEvent(name) {
    if (typeof events[name] === 'function') events[name]();
  }

  function trackQuartiles() {
    if (!video || isNaN(video.duration)) return;

    const checkQuartiles = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;
      if (!quartileEventsFired[25] && currentTime >= duration * 0.25) {
        callEvent('AdVideoFirstQuartile');
        quartileEventsFired[25] = true;
      }
      if (!quartileEventsFired[50] && currentTime >= duration * 0.5) {
        callEvent('AdVideoMidpoint');
        quartileEventsFired[50] = true;
      }
      if (!quartileEventsFired[75] && currentTime >= duration * 0.75) {
        callEvent('AdVideoThirdQuartile');
        quartileEventsFired[75] = true;
      }
    };

    video.addEventListener('timeupdate', checkQuartiles);
  }

  return {
    handshakeVersion: function(version) {
      return '2.0';
    },
    initAd: function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      const adParams = JSON.parse(creativeData.AdParameters || '{}');
      clickThrough = 'https://www.coca-colacompany.com/';
      clickTrackers = adParams.clickTrackers || [];
      video = environmentVars.videoSlot;
      adContainer = environmentVars.slot;

      if (!video || !adParams.mediaFiles || !adParams.mediaFiles[0]?.uri) {
        callEvent('AdError');
        return;
      }

      // Set up the video
      video.src = adParams.mediaFiles[0].uri;
      video.load();
      video.onended = () => this.stopAd();
      video.onplay = () => callEvent('AdImpression');

      // Style ad container
      adContainer.style.position = 'relative';
      adContainer.style.width = width + 'px';
      adContainer.style.height = height + 'px';
      adContainer.style.overflow = 'hidden';
      adContainer.style.backgroundColor = 'black';

      // Left vertical Coca-Cola banner
      const leftBannerLink = document.createElement('a');
      leftBannerLink.href = clickThrough;
      leftBannerLink.target = '_blank';
      leftBannerLink.style.position = 'absolute';
      leftBannerLink.style.left = '-20%';
      leftBannerLink.style.top = '0';
      leftBannerLink.style.width = '20%';
      leftBannerLink.style.height = '100%';
      leftBannerLink.style.zIndex = '10';
      leftBannerLink.style.transition = 'left 1s ease';

      const leftBanner = document.createElement('img');
      leftBanner.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      leftBanner.style.width = '100%';
      leftBanner.style.height = '100%';
      leftBanner.style.objectFit = 'cover';
      leftBanner.style.cursor = 'pointer';

      leftBannerLink.appendChild(leftBanner);
      adContainer.appendChild(leftBannerLink);

      // Bottom horizontal Coca-Cola banner
      const bottomBannerLink = document.createElement('a');
      bottomBannerLink.href = clickThrough;
      bottomBannerLink.target = '_blank';
      bottomBannerLink.style.position = 'absolute';
      bottomBannerLink.style.bottom = '-20%';
      bottomBannerLink.style.left = '0';
      bottomBannerLink.style.width = '100%';
      bottomBannerLink.style.height = '20%';
      bottomBannerLink.style.zIndex = '10';
      bottomBannerLink.style.transition = 'bottom 1s ease';

      const bottomBanner = document.createElement('img');
      bottomBanner.src = 'https://vast.thebesads.com/images/bottom-banner.jpg';
      bottomBanner.style.width = '100%';
      bottomBanner.style.height = '100%';
      bottomBanner.style.objectFit = 'cover';
      bottomBanner.style.cursor = 'pointer';

      bottomBannerLink.appendChild(bottomBanner);
      adContainer.appendChild(bottomBannerLink);

      // Animate banners into view
      setTimeout(() => {
        leftBannerLink.style.left = '0';
        bottomBannerLink.style.bottom = '0';
      }, 100);

      // Animate video into top-right quadrant
      if (video && video.style) {
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '20%';
        video.style.width = '80%';
        video.style.height = '80%';
        video.style.transition = 'all 1s ease';
      }

      // Click button overlay
      const visitBtn = document.createElement('button');
      visitBtn.textContent = 'Visit Site';
      visitBtn.style.position = 'absolute';
      visitBtn.style.bottom = '10px';
      visitBtn.style.right = '10px';
      visitBtn.style.zIndex = '20';
      visitBtn.style.background = 'transparent';
      visitBtn.style.border = '1px solid white';
      visitBtn.style.color = 'white';
      visitBtn.style.padding = '8px 12px';
      visitBtn.style.cursor = 'pointer';
      visitBtn.style.fontSize = '14px';
      visitBtn.onmouseover = () => visitBtn.style.opacity = '0.7';
      visitBtn.onmouseout = () => visitBtn.style.opacity = '1';
      visitBtn.onclick = () => {
        clickTrackers.forEach(url => new Image().src = url);
        window.open(clickThrough, '_blank');
      };
      adContainer.appendChild(visitBtn);

      callEvent('AdLoaded');
    },
    startAd: function() {
      video.play().then(() => {
        callEvent('AdStarted');
        trackQuartiles();
      }).catch(() => callEvent('AdError'));
    },
    stopAd: function() {
      callEvent('AdStopped');
    },
    pauseAd: function() {
      video?.pause();
      callEvent('AdPaused');
    },
    resumeAd: function() {
      video?.play();
      callEvent('AdPlaying');
    },
    expandAd: function() {},
    collapseAd: function() {},
    skipAd: function() {},
    resizeAd: function(width, height, viewMode) {},
    getAdLinear: function() { return true; },
    getAdDuration: function() { return video?.duration || 0; },
    getAdRemainingTime: function() { return video ? video.duration - video.currentTime : 0; },
    getAdVolume: function() { return video ? video.volume : _volume; },
    setAdVolume: function(val) {
      _volume = val;
      if (video) video.volume = val;
    },
    getAdSkippableState: function() { return false; },
    getAdExpanded: function() { return false; },
    getAdIcons: function() { return false; },
    getAdWidth: function() { return video ? video.videoWidth || 640 : 640; },
    getAdHeight: function() { return video ? video.videoHeight || 360 : 360; },
    subscribe: function(callback, eventName) {
      events[eventName] = callback;
    },
    unsubscribe: function(eventName) {
      delete events[eventName];
    }
  };
}

window.getVPAIDAd = getVPAIDAd;
