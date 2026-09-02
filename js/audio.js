var TWB = window.TWB || {};

TWB.Audio = {
    ctx: null,
    master: null,
    ambientGain: null,
    sfxGain: null,
    initialized: false,
    ambientNodes: {},
    _normGains: {},
    TARGET_RMS: 0.15,

    init: function() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.6;
            this.master.connect(this.ctx.destination);

            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.value = 0.5;
            this.ambientGain.connect(this.master);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.7;
            this.sfxGain.connect(this.master);

            this.initialized = true;
        } catch (e) {}
    },

    resume: function() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    createNoise: function(duration, type) {
        var sr = this.ctx.sampleRate;
        var len = sr * duration;
        var buf = this.ctx.createBuffer(1, len, sr);
        var data = buf.getChannelData(0);
        if (type === 'brown') {
            var last = 0;
            for (var i = 0; i < len; i++) {
                var w = (Math.random() * 2 - 1) * 0.05;
                last = (last + w) * 0.98;
                data[i] = last * 3.5;
            }
        } else {
            for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        }
        return buf;
    },

    getPan: function(game, wx, wy) {
        var dx = wx - game.player.x;
        var dy = wy - game.player.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var pan = Math.max(-1, Math.min(1, dx / 200));
        var vol = Math.max(0, 1 - dist / 500);
        return { pan: pan, vol: vol, dist: dist };
    },

    playDirectional: function(game, wx, wy, soundFn) {
        if (!this.initialized) return;
        var p = this.getPan(game, wx, wy);
        if (p.vol <= 0) return;
        var panner = this.ctx.createStereoPanner();
        panner.pan.value = p.pan;
        var gain = this.ctx.createGain();
        gain.gain.value = p.vol;
        gain.connect(panner);
        panner.connect(this.sfxGain);
        soundFn(this.ctx, gain);
    },

    branchSnap: function(game, wx, wy) {
        this.playDirectional(game, wx, wy, function(ctx, dest) {
            var buf = TWB.Audio.createNoise(0.15, 'white');
            var src = ctx.createBufferSource();
            src.buffer = buf;
            var flt = ctx.createBiquadFilter();
            flt.type = 'bandpass';
            flt.frequency.value = 1800;
            flt.Q.value = 2;
            var g = ctx.createGain();
            g.gain.setValueAtTime(0.8, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            src.connect(flt);
            flt.connect(g);
            g.connect(dest);
            src.start();
            src.stop(ctx.currentTime + 0.15);
        });
    },

    distantWolf: function(game, wx, wy) {
        this.playDirectional(game, wx, wy, function(ctx, dest) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            var now = ctx.currentTime;
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.linearRampToValueAtTime(420, now + 0.6);
            osc.frequency.linearRampToValueAtTime(380, now + 1.2);
            osc.frequency.linearRampToValueAtTime(300, now + 2.0);
            osc.frequency.linearRampToValueAtTime(250, now + 2.8);
            var g = ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.12, now + 0.3);
            g.gain.setValueAtTime(0.12, now + 1.5);
            g.gain.linearRampToValueAtTime(0, now + 2.8);
            var vib = ctx.createOscillator();
            vib.frequency.value = 5;
            var vibG = ctx.createGain();
            vibG.gain.value = 8;
            vib.connect(vibG);
            vibG.connect(osc.frequency);
            vib.start();
            var flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.value = 600;
            osc.connect(flt);
            flt.connect(g);
            g.connect(dest);
            osc.start();
            osc.stop(now + 3);
            vib.stop(now + 3);
        });
    },

    dogBreathing: function(game) {
        if (!this.initialized) return;
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var buf = this.createNoise(1.2, 'white');
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'bandpass';
        flt.frequency.value = 400;
        flt.Q.value = 1;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06, now + 0.15);
        g.gain.linearRampToValueAtTime(0.02, now + 0.4);
        g.gain.linearRampToValueAtTime(0.06, now + 0.55);
        g.gain.linearRampToValueAtTime(0, now + 0.9);
        src.connect(flt);
        flt.connect(g);
        g.connect(this.ambientGain);
        src.start();
        src.stop(now + 1.2);
    },

    dogGrowl: function(game) {
        if (!this.initialized) return;
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.3);
        osc.frequency.linearRampToValueAtTime(75, now + 0.8);
        var noise = ctx.createBufferSource();
        noise.buffer = this.createNoise(1.0, 'brown');
        var nflt = ctx.createBiquadFilter();
        nflt.type = 'lowpass';
        nflt.frequency.value = 200;
        noise.connect(nflt);
        var nGain = ctx.createGain();
        nGain.gain.value = 0.15;
        nflt.connect(nGain);
        var flt = ctx.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.value = 250;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.18, now + 0.1);
        g.gain.setValueAtTime(0.18, now + 0.6);
        g.gain.linearRampToValueAtTime(0, now + 0.9);
        osc.connect(flt);
        flt.connect(g);
        nGain.connect(g);
        g.connect(this.sfxGain);
        osc.start();
        osc.stop(now + 1.0);
        noise.start();
        noise.stop(now + 1.0);
    },

    _analyzeRMS: function(name, decoded) {
        var sum = 0;
        var total = 0;
        for (var ch = 0; ch < decoded.numberOfChannels; ch++) {
            var data = decoded.getChannelData(ch);
            for (var i = 0; i < data.length; i++) {
                sum += data[i] * data[i];
            }
            total += data.length;
        }
        var rms = Math.sqrt(sum / total);
        var gain = rms > 0.001 ? this.TARGET_RMS / rms : 1;
        if (gain > 4) gain = 4;
        this._normGains[name] = gain;
    },

    _normVol: function(name, vol) {
        var ng = this._normGains[name];
        return ng ? vol * ng : vol;
    },

    _decodeAndPlay: function(name, loop, gainNode, vol) {
        var self = this;
        var raw = TWB.AudioBuffers[name];
        if (!raw) return;
        this.ctx.decodeAudioData(raw.slice(0), function(decoded) {
            TWB.AudioBuffers[name + '_decoded'] = decoded;
            self._analyzeRMS(name, decoded);
            if (name === 'footstep' && !self._wantFootsteps) return;
            var src = self.ctx.createBufferSource();
            src.buffer = decoded;
            src.loop = loop;
            var g = self.ctx.createGain();
            g.gain.value = self._normVol(name, vol);
            src.connect(g);
            g.connect(gainNode);
            src.start();
            self.ambientNodes[name] = { src: src, gain: g };
        });
    },

    _playDecoded: function(name, loop, gainNode, vol) {
        var decoded = TWB.AudioBuffers[name + '_decoded'];
        if (!decoded) {
            this._decodeAndPlay(name, loop, gainNode, vol);
            return;
        }
        if (!this._normGains[name]) this._analyzeRMS(name, decoded);
        var src = this.ctx.createBufferSource();
        src.buffer = decoded;
        src.loop = loop;
        var g = this.ctx.createGain();
        g.gain.value = this._normVol(name, vol);
        src.connect(g);
        g.connect(gainNode);
        src.start();
        this.ambientNodes[name] = { src: src, gain: g };
    },

    startRain: function() {
        if (!this.initialized || this.ambientNodes.rain_loop) return;
        this._wantRain = true;
        this._playDecoded('rain_loop', true, this.ambientGain, 0);
        var self = this;
        var fadeIn = function() {
            var r = self.ambientNodes.rain_loop;
            if (r) {
                r.gain.gain.linearRampToValueAtTime(self._normVol('rain_loop', 0.4), self.ctx.currentTime + 3);
            } else if (self._wantRain) {
                setTimeout(fadeIn, 100);
            }
        };
        setTimeout(fadeIn, 50);
    },

    stopRain: function() {
        this._wantRain = false;
        if (!this.ambientNodes.rain_loop) return;
        var r = this.ambientNodes.rain_loop;
        r.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 3);
        var s = r.src;
        setTimeout(function() { try { s.stop(); } catch(e) {} }, 3500);
        this.ambientNodes.rain_loop = null;
    },

    startWind: function(speed) {
        if (!this.initialized) return;
        var vol = Math.min(0.5, speed * 0.15);
        this._windVol = vol;
        if (!this.ambientNodes.wind_loop) {
            this._playDecoded('wind_loop', true, this.ambientGain, 0);
            var self = this;
            var fadeIn = function() {
                var w = self.ambientNodes.wind_loop;
                if (w) {
                    w.gain.gain.linearRampToValueAtTime(self._normVol('wind_loop', self._windVol), self.ctx.currentTime + 2);
                } else {
                    setTimeout(fadeIn, 100);
                }
            };
            setTimeout(fadeIn, 50);
            return;
        }
        var w = this.ambientNodes.wind_loop;
        w.gain.gain.linearRampToValueAtTime(this._normVol('wind_loop', vol), this.ctx.currentTime + 2);
    },

    playRiver: function(game, riverX, riverY) {
        this.playDirectional(game, riverX, riverY, function(ctx, dest) {
            var buf = TWB.Audio.createNoise(0.5, 'brown');
            var src = ctx.createBufferSource();
            src.buffer = buf;
            src.loop = false;
            var flt = ctx.createBiquadFilter();
            flt.type = 'bandpass';
            flt.frequency.value = 500;
            flt.Q.value = 0.5;
            var g = ctx.createGain();
            g.gain.value = 0.1;
            src.connect(flt);
            flt.connect(g);
            g.connect(dest);
            src.start();
            src.stop(ctx.currentTime + 0.5);
        });
    },

    footstep: function(game) {
        if (!this.initialized) return;
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var buf = this.createNoise(0.08, 'brown');
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var flt = ctx.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.value = 600;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        src.connect(flt);
        flt.connect(g);
        g.connect(this.sfxGain);
        src.start();
        src.stop(now + 0.08);
    },

    cabinCreak: function() {
        if (!this.initialized) return;
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        var startF = 150 + Math.random() * 100;
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.linearRampToValueAtTime(startF - 30 + Math.random() * 60, now + 0.4);
        osc.frequency.linearRampToValueAtTime(startF + 10, now + 0.8);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.04, now + 0.05);
        g.gain.linearRampToValueAtTime(0.03, now + 0.4);
        g.gain.linearRampToValueAtTime(0, now + 0.8);
        var flt = ctx.createBiquadFilter();
        flt.type = 'bandpass';
        flt.frequency.value = 200;
        flt.Q.value = 5;
        osc.connect(flt);
        flt.connect(g);
        g.connect(this.ambientGain);
        osc.start();
        osc.stop(now + 0.9);
    },

    distantScream: function(game, wx, wy) {
        this.playDirectional(game, wx, wy, function(ctx, dest) {
            var now = ctx.currentTime;
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(900, now + 0.15);
            osc.frequency.linearRampToValueAtTime(700, now + 0.6);
            osc.frequency.linearRampToValueAtTime(500, now + 1.2);
            var vib = ctx.createOscillator();
            vib.frequency.value = 7;
            var vibG = ctx.createGain();
            vibG.gain.value = 20;
            vib.connect(vibG);
            vibG.connect(osc.frequency);
            var g = ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.06, now + 0.1);
            g.gain.setValueAtTime(0.06, now + 0.4);
            g.gain.linearRampToValueAtTime(0, now + 1.2);
            var flt = ctx.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.value = 800;
            osc.connect(flt);
            flt.connect(g);
            g.connect(dest);
            osc.start();
            vib.start();
            osc.stop(now + 1.3);
            vib.stop(now + 1.3);
        });
    },

    playSFX: function(name, loop, vol) {
        if (!this.initialized) return null;
        var decoded = TWB.AudioBuffers[name + '_decoded'];
        var raw = TWB.AudioBuffers[name];
        if (!decoded && !raw) return null;
        if (decoded) {
            if (!this._normGains[name]) this._analyzeRMS(name, decoded);
            var src = this.ctx.createBufferSource();
            src.buffer = decoded;
            src.loop = !!loop;
            var g = this.ctx.createGain();
            g.gain.value = this._normVol(name, vol || 0.5);
            src.connect(g);
            g.connect(this.sfxGain);
            src.start();
            return { src: src, gain: g };
        }
        var self = this;
        this.ctx.decodeAudioData(raw.slice(0), function(buf) {
            TWB.AudioBuffers[name + '_decoded'] = buf;
            self._analyzeRMS(name, buf);
            self.playSFX(name, loop, vol);
        });
        return null;
    },

    stopAmbient: function(name) {
        if (!this.ambientNodes[name]) return;
        var node = this.ambientNodes[name];
        node.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        var s = node.src;
        setTimeout(function() { try { s.stop(); } catch(e) {} }, 700);
        this.ambientNodes[name] = null;
    },

    startFootsteps: function() {
        if (!this.initialized || this.ambientNodes.footstep) return;
        this._wantFootsteps = true;
        this._playDecoded('footstep', true, this.sfxGain, 0.08);
    },

    stopFootsteps: function() {
        this._wantFootsteps = false;
        if (!this.ambientNodes.footstep) return;
        var node = this.ambientNodes.footstep;
        try { node.src.stop(); } catch(e) {}
        this.ambientNodes.footstep = null;
    },

    updateFire: function(vol) {
        if (!this.initialized) return;
        if (vol > 0.01) {
            if (!this.ambientNodes.fire) {
                this._playDecoded('fire', true, this.ambientGain, 0);
            }
            var f = this.ambientNodes.fire;
            if (f) f.gain.gain.linearRampToValueAtTime(this._normVol('fire', vol), this.ctx.currentTime + 0.3);
        } else if (this.ambientNodes.fire) {
            var node = this.ambientNodes.fire;
            node.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
            var s = node.src;
            setTimeout(function() { try { s.stop(); } catch(e) {} }, 2000);
            this.ambientNodes.fire = null;
        }
    },

    bushRustle: function(game, wx, wy) {
        this.playDirectional(game, wx, wy, function(ctx, dest) {
            var now = ctx.currentTime;
            for (var i = 0; i < 3; i++) {
                var t = now + i * 0.12 + Math.random() * 0.05;
                var buf = TWB.Audio.createNoise(0.1, 'white');
                var src = ctx.createBufferSource();
                src.buffer = buf;
                var flt = ctx.createBiquadFilter();
                flt.type = 'bandpass';
                flt.frequency.value = 2000 + Math.random() * 2000;
                flt.Q.value = 1;
                var g = ctx.createGain();
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                src.connect(flt);
                flt.connect(g);
                g.connect(dest);
                src.start(t);
                src.stop(t + 0.1);
            }
        });
    }
};

window.TWB = TWB;
