
function getVPAIDAd() {
  let adContainer = null;
  let video = null;
  let _events = {};

  return {
    handshakeVersion: () => '2.0',

    initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      const self = this;
      video = environmentVars.videoSlot;
      adContainer = environmentVars.slot;

      adContainer.innerHTML = '';
      adContainer.style.position = 'relative';
      adContainer.style.width = '100%';
      adContainer.style.height = '100%';
      adContainer.style.overflow = 'hidden';
      adContainer.style.backgroundColor = 'black';

      Object.assign(video.style, {
        position: 'absolute',
        top: '0',
        left: '20%',
        width: '80%',
        height: '80%',
        zIndex: '10',
        opacity: '0',
        transition: 'opacity 1s ease-in'
      });
      video.muted = true;
      video.setAttribute('playsinline', '');
      adContainer.appendChild(video);

      function loadHLS() {
        const hlsScript = document.createElement('script');
        hlsScript.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        hlsScript.onload = () => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play();
              self._callEvent('AdStarted');
            });
          } else {
            loadDASH(); // fallback
          }
        };
        hlsScript.onerror = loadDASH;
        document.head.appendChild(hlsScript);
      }

      function loadDASH() {
        const dashScript = document.createElement('script');
        dashScript.src = 'https://cdn.dashjs.org/latest/dash.all.min.js';
        dashScript.onload = () => {
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd', true);
          self._callEvent('AdStarted');
        };
        document.head.appendChild(dashScript);
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        video.addEventListener('loadedmetadata', function () {
          video.play();
          self._callEvent('AdStarted');
        });
      } else {
        loadHLS();
      }

      const sideBanner = document.createElement('img');
      sideBanner.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      Object.assign(sideBanner.style, {
        position: 'absolute',
        left: '-20%',
        top: '0',
        width: '20%',
        height: '100%',
        objectFit: 'cover',
        zIndex: '5',
        transition: 'left 1s ease-out',
        cursor: 'pointer'
      });
      sideBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=side';
        window.open('https://www.coca-colacompany.com/', '_blank');
      };
      adContainer.appendChild(sideBanner);

      const bottomBanner = document.createElement('img');
      bottomBanner.src = 'https://vast.thebesads.com/images/bottom-banner.jpg';
      Object.assign(bottomBanner.style, {
        position: 'absolute',
        bottom: '-20%',
        left: '20%',
        width: '80%',
        height: '20%',
        objectFit: 'cover',
        zIndex: '5',
        transition: 'bottom 1s ease-out',
        cursor: 'pointer'
      });
      bottomBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=bottom';
        window.open('https://www.coca-colacompany.com/', '_blank');
      };
      adContainer.appendChild(bottomBanner);

      setTimeout(() => {
        video.style.opacity = '1';
        sideBanner.style.left = '0';
        bottomBanner.style.bottom = '0';
      }, 100);

      video.addEventListener('ended', () => {
        self._callEvent('AdVideoComplete');
        self.stopAd();
      });

      this._callEvent('AdLoaded');
    },

    startAd() {
      video?.play();
    },
    stopAd() { this._callEvent('AdStopped'); },
    pauseAd() { video?.pause(); },
    resumeAd() { video?.play(); },
    expandAd() {}, collapseAd() {}, skipAd() {}, resizeAd() {},
    getAdLinear() { return true; },
    getAdExpanded() { return false; },
    getAdSkippableState() { return false; },
    getAdDuration() { return video?.duration || 30; },
    getAdRemainingTime() { return video ? video.duration - video.currentTime : 0; },
    getAdVolume() { return video?.volume || 1; },
    setAdVolume(val) { if (video) video.volume = val; },
    getAdWidth() { return video?.videoWidth || 640; },
    getAdHeight() { return video?.videoHeight || 360; },
    getAdIcons() { return false; },
    subscribe(callback, event) { _events[event] = callback; },
    unsubscribe(event) { delete _events[event]; },
    _callEvent(event) {
      if (typeof _events[event] === 'function') _events[event]();
    }
  };
}

window.getVPAIDAd = getVPAIDAd;
