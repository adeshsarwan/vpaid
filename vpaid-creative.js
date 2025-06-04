function getVPAIDAd() {
  let adContainer, video, clickThrough, clickTrackers = [];

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

      if (video) {
        video.src = adParams.mediaFiles?.[0]?.uri || '';
        video.load();
        video.onended = () => this.stopAd();
      }

      const visitBtn = document.createElement('button');
      visitBtn.textContent = 'Visit Site';
      visitBtn.onclick = () => {
        clickTrackers.forEach(url => new Image().src = url);
        window.open(clickThrough, '_blank');
      };
      adContainer.appendChild(visitBtn);

      this._callEvent('AdLoaded');
    },
    startAd: function() {
      video.play();
      this._callEvent('AdStarted');
    },
    stopAd: function() {
      this._callEvent('AdStopped');
    },
    _events: {},
    subscribe: function(callback, eventName) {
      this._events[eventName] = callback;
    },
    _callEvent: function(name) {
      if (typeof this._events[name] === 'function') this._events[name]();
    }
  };
}