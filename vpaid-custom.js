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

      // Style ad container to allow absolute positioning
      adContainer.style.position = 'relative';
      adContainer.style.width = width + 'px';
      adContainer.style.height = height + 'px';
      adContainer.style.overflow = 'hidden';

      // Create wrapper for image animation
      const imageLink = document.createElement('a');
      imageLink.href = clickThrough;
      imageLink.target = '_blank';
      imageLink.style.position = 'absolute';
      imageLink.style.top = '0';
      imageLink.style.left = '-20%';
      imageLink.style.height = '100%';
      imageLink.style.width = '20%';
      imageLink.style.zIndex = '10';
      imageLink.style.transition = 'left 1s ease';

      const image = document.createElement('img');
      image.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      image.style.height = '100%';
      image.style.width = '100%';
      image.style.objectFit = 'cover';
      image.style.cursor = 'pointer';

      imageLink.appendChild(image);
      adContainer.appendChild(imageLink);

      // Animate image into view
      setTimeout(() => {
        imageLink.style.left = '0';
      }, 100);

      // Animate video resizing safely
      if (video && video.style) {
        video.style.position = 'absolute';
        video.style.left = '0';
        video.style.top = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.transition = 'left 1s ease, width 1s ease';

        setTimeout(() => {
          video.style.left = '20%';
          video.style.bottom = '20%';
          video.style.width = '80%';
          video.style.height = '80%';
        }, 100);
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
