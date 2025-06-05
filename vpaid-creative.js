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

      if (!video || !adParams.mediaFiles || !adParams.mediaFiles[0]?.uri) {
        callEvent('AdError');
        return;
      }

      // Set up the video
      video.src = adParams.mediaFiles[0].uri;
      video.load();
      video.onended = () => this.stopAd();
      video.onplay = () => callEvent('AdImpression');

      // Create a container to hold both the image and the video
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.height = height + 'px';

      const image = document.createElement('img');
      image.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      image.style.height = '100%';
      image.style.marginRight = '10px';
      wrapper.appendChild(image);

      // Place video next to image
      video.style.flex = '1';
      wrapper.appendChild(video);

      // Click button
      const visitBtn = document.createElement('button');
      visitBtn.textContent = 'Visit Site';
      visitBtn.onclick = () => {
        clickTrackers.forEach(url => new Image().src = url);
        window.open(clickThrough, '_blank');
      };
      wrapper.appendChild(visitBtn);

      adContainer.appendChild(wrapper);

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
