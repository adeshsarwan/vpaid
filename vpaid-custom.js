
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
      clickThrough = adParams.clickThroughUrl || '';
      clickTrackers = adParams.clickTrackers || [];
      video = environmentVars.videoSlot;
      adContainer = environmentVars.slot;

      if (!video || !adContainer || !adParams.mediaFiles || !adParams.mediaFiles.length) {
        callEvent('AdError');
        return;
      }

      // Select playable media file
      let selectedFile = null;
      for (let mf of adParams.mediaFiles) {
        if (mf.type === 'application/x-mpegURL' && video.canPlayType('application/vnd.apple.mpegurl')) {
          selectedFile = mf.uri;
          break;
        } else if (mf.type === 'application/dash+xml' && typeof dashjs !== 'undefined') {
          selectedFile = mf.uri;
          break;
        } else if (mf.type === 'video/mp4' && video.canPlayType('video/mp4')) {
          selectedFile = mf.uri;
        }
      }

      if (!selectedFile) {
        callEvent('AdError');
        return;
      }

      // Layout setup
      adContainer.style.position = 'relative';
      adContainer.style.width = width + 'px';
      adContainer.style.height = height + 'px';
      adContainer.style.overflow = 'hidden';

      // Left banner (20% width, full height)
      const leftBanner = document.createElement('a');
      leftBanner.href = clickThrough;
      leftBanner.target = '_blank';
      leftBanner.style.position = 'absolute';
      leftBanner.style.left = '-20%';
      leftBanner.style.top = '0';
      leftBanner.style.width = '20%';
      leftBanner.style.height = '100%';
      leftBanner.style.zIndex = '10';
      leftBanner.style.transition = 'left 1s ease';

      const leftImg = document.createElement('img');
      leftImg.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      leftImg.style.width = '100%';
      leftImg.style.height = '100%';
      leftImg.style.objectFit = 'cover';
      leftImg.style.cursor = 'pointer';
      leftBanner.appendChild(leftImg);
      adContainer.appendChild(leftBanner);

      // Bottom banner (80% width, 20% height)
      const bottomBanner = document.createElement('a');
      bottomBanner.href = clickThrough;
      bottomBanner.target = '_blank';
      bottomBanner.style.position = 'absolute';
      bottomBanner.style.left = '20%';
      bottomBanner.style.bottom = '-20%';
      bottomBanner.style.width = '80%';
      bottomBanner.style.height = '20%';
      bottomBanner.style.zIndex = '10';
      bottomBanner.style.transition = 'bottom 1s ease';

      const bottomImg = document.createElement('img');
      bottomImg.src = 'https://vast.thebesads.com/images/bottom-banner.jpg';
      bottomImg.style.width = '100%';
      bottomImg.style.height = '100%';
      bottomImg.style.objectFit = 'cover';
      bottomImg.style.cursor = 'pointer';
      bottomBanner.appendChild(bottomImg);
      adContainer.appendChild(bottomBanner);

      // Video wrapper (80% width and height at top-right)
      const videoWrapper = document.createElement('div');
      videoWrapper.style.position = 'absolute';
      videoWrapper.style.top = '0';
      videoWrapper.style.left = '20%';
      videoWrapper.style.width = '80%';
      videoWrapper.style.height = '80%';
      videoWrapper.style.overflow = 'hidden';

      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';

      videoWrapper.appendChild(video);
      adContainer.appendChild(videoWrapper);

      // Animate banners
      setTimeout(() => {
        leftBanner.style.left = '0';
        bottomBanner.style.bottom = '0';
      }, 100);

      // Play video
      if (selectedFile.endsWith('.mpd') && typeof dashjs !== 'undefined') {
        const player = dashjs.MediaPlayer().create();
        player.initialize(video, selectedFile, false);
      } else {
        video.src = selectedFile;
      }

      video.load();
      video.onended = () => this.stopAd();
      video.onplay = () => callEvent('AdImpression');

      // Click overlay
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
