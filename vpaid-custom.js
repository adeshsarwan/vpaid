
function getVPAIDAd() {
  let video = null;
  let adContainer, video, _events = {}, duration = 0;
  let quartilesFired = { first: false, midpoint: false, third: false, complete: false };

  return {
    handshakeVersion: () => '2.0',

    initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
      const adParams = JSON.parse(creativeData.AdParameters || '{}');
      const videoFile = adParams.mediaFiles?.[0]?.uri || 'https://vast.thebesads.com/video/my-ad-video.mp4';
      const clickThroughUrl = 'https://www.coca-colacompany.com/';

      video = environmentVars.videoSlot;
      if (!video) {
        console.warn('videoSlot is null. Creating fallback <video> element.');
        video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', 'true');
        video.autoplay = true;
        video.muted = true;
        adContainer.appendChild(video);
      }

      console.log('videoSlot received:', video);
      console.log('video element info:', {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState,
        muted: video.muted,
        autoplay: video.autoplay
      });

      // Force visible and sized in case videoSlot is hidden
      video.style.display = 'block';
      video.style.width = '640px';
      video.style.height = '360px';
      video.style.backgroundColor = 'black';

      adContainer = environmentVars.slot;

      adContainer.style.position = 'relative';
      adContainer.style.width = '100%';
      adContainer.style.height = '100%';
      adContainer.style.overflow = 'hidden';
      adContainer.style.backgroundColor = 'black';

      if (video && video.style) {
        const hlsSource = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        const dashSource = 'https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd';

        function loadHLS() {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
          script.onload = () => {
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(hlsSource);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
              });
            } else {
              loadDASH();
            }
          };
          script.onerror = loadDASH;
          document.head.appendChild(script);
        }

        function loadDASH() {
          const script = document.createElement('script');
          script.src = 'https://cdn.dashjs.org/latest/dash.all.min.js';
          script.onload = () => {
            if (dashjs) {
              const player = dashjs.MediaPlayer().create();
              player.initialize(video, dashSource, true);
            }
          };
          document.head.appendChild(script);
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
          video.addEventListener('loadedmetadata', () => {
            video.play();
          });
        } else {
          loadHLS();
        }

        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '20%';
        video.style.width = '80%';
        video.style.height = '80%';
        video.style.zIndex = '10';
        video.style.opacity = '0';
        video.style.transition = 'opacity 1s ease-in';
        video.muted = true;
        setTimeout(() => {
          video.style.opacity = '1';
        }, 100);
        // Skipped re-appending videoSlot (already provided by environmentVars)
      }

      const sideBanner = document.createElement('img');
      sideBanner.src = 'https://vast.thebesads.com/images/side-banner.jpg';
      Object.assign(sideBanner.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '20%',
        height: '100%',
        objectFit: 'cover',
        zIndex: '5',
        opacity: '0',
        transition: 'opacity 1s ease-in',
        cursor: 'pointer'
      });
      sideBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=side';
        window.open(clickThroughUrl, '_blank');
      };

      const bottomBanner = document.createElement('img');
      bottomBanner.src = 'https://vast.thebesads.com/images/bottom-banner.jpg';
      Object.assign(bottomBanner.style, {
        position: 'absolute',
        bottom: '0',
        left: '20%',
        width: '80%',
        height: '20%',
        objectFit: 'cover',
        zIndex: '5',
        opacity: '0',
        transition: 'opacity 1s ease-in',
        cursor: 'pointer'
      });
      bottomBanner.onclick = () => {
        new Image().src = 'https://vast.thebesads.com/track/click?source=bottom';
        window.open(clickThroughUrl, '_blank');
      };

      adContainer.appendChild(sideBanner);
      adContainer.appendChild(bottomBanner);

      setTimeout(() => {
        sideBanner.style.opacity = '1';
        bottomBanner.style.opacity = '1';
      }, 100);

      video.addEventListener('timeupdate', () => {
        duration = video.duration || 30;
        const current = video.currentTime;
        if (!quartilesFired.first && current >= duration * 0.25) {
          console.log('Calling _callEvent: AdVideoFirstQuartile');
      this._callEvent('AdVideoFirstQuartile');
          quartilesFired.first = true;
        }
        if (!quartilesFired.midpoint && current >= duration * 0.5) {
          console.log('Calling _callEvent: AdVideoMidpoint');
      this._callEvent('AdVideoMidpoint');
          quartilesFired.midpoint = true;
        }
        if (!quartilesFired.third && current >= duration * 0.75) {
          console.log('Calling _callEvent: AdVideoThirdQuartile');
      this._callEvent('AdVideoThirdQuartile');
          quartilesFired.third = true;
        }
      });

      video.onended = () => {
        if (!quartilesFired.complete) {
          console.log('Calling _callEvent: AdVideoComplete');
      this._callEvent('AdVideoComplete');
          quartilesFired.complete = true;
        }
        this.stopAd();
      };

      console.log('Calling _callEvent: AdLoaded');
      this._callEvent('AdLoaded');
      setTimeout(() => {
        console.warn('Fallback: Forcing AdStarted after 5s timeout.');
        self._callEvent('AdStarted');
      }, 5000);
    },

    startAd: function () {
      video?.play();
      console.log('Calling _callEvent: AdStarted');
      this._callEvent('AdStarted');
    },

    stopAd: function () {
      console.log('Calling _callEvent: AdStopped');
      this._callEvent('AdStopped');
    },

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
      console.log('Triggering event:', event);
      if (typeof _events[event] === 'function') _events[event]();
    }
  };
}
window.getVPAIDAd = getVPAIDAd;
