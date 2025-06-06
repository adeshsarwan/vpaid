
function getVPAIDAd() {
  let adContainer = null;
  let video = null;
  let _events = {};
  let duration = 30;

  return {
    handshakeVersion: function(version) {
      return '2.0';
    },

    initAd: function(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      const self = this;
      video = environmentVars.videoSlot;
      adContainer = environmentVars.slot;

      if (!video || typeof video !== 'object') {
        console.warn('No valid videoSlot provided. Creating a fallback <video> element.');
        video = document.createElement('video');
        adContainer.appendChild(video);
      }

      try {
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        video.autoplay = true;

        if (video.style) {
          video.style.display = 'block';
          video.style.width = '640px';
          video.style.height = '360px';
          video.style.backgroundColor = 'black';
        }

        console.log('Final video element ready:', video);
      } catch (err) {
        console.error('Failed to configure video element:', err);
      }

      const hls = document.createElement('script');
      hls.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      hls.onload = () => {
        if (Hls.isSupported()) {
          const hlsPlayer = new Hls();
          hlsPlayer.loadSource('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(() => {
              self._callEvent('AdStarted');
            }).catch(e => {
              console.error('Playback failed:', e);
              setTimeout(() => self._callEvent('AdStarted'), 3000); // fallback
            });
          });
        }
      };
      document.head.appendChild(hls);

      this._callEvent('AdLoaded');
    },

    startAd: function() {
      try {
        console.log("startAd called");
        video?.play();
        this._callEvent('AdStarted');
      } catch (e) {
        console.error("Error in startAd:", e);
      }
    },

    stopAd: function() {
      this._callEvent('AdStopped');
    },

    pauseAd: function() {
      video?.pause();
    },

    resumeAd: function() {
      video?.play();
    },

    expandAd: function() {},
    collapseAd: function() {},
    skipAd: function() {},

    resizeAd: function(width, height, viewMode) {},

    getAdLinear: function() {
      return true;
    },

    getAdExpanded: function() {
      return false;
    },

    getAdSkippableState: function() {
      return false;
    },

    getAdIcons: function() {
      return false;
    },

    getAdDuration: function() {
      return duration;
    },

    getAdRemainingTime: function() {
      return video ? duration - video.currentTime : duration;
    },

    getAdVolume: function() {
      return video?.volume || 1;
    },

    setAdVolume: function(val) {
      if (video) video.volume = val;
    },

    getAdWidth: function() {
      return video?.videoWidth || 640;
    },

    getAdHeight: function() {
      return video?.videoHeight || 360;
    },

    subscribe: function(callback, event) {
      _events[event] = callback;
    },

    unsubscribe: function(event) {
      delete _events[event];
    },

    _callEvent: function(event) {
      console.log('Triggering event:', event);
      if (typeof _events[event] === 'function') {
        _events[event]();
      }
    }
  };
}
window.getVPAIDAd = getVPAIDAd;
