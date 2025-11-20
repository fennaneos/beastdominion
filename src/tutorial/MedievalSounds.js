// MedievalSounds.js
// Simple wrapper around HTMLAudioElements for tutorial playback.

const swordUrl =
  "https://freesound.org/data/previews/442/442763_9159316-lq.mp3";
const fireUrl =
  "https://freesound.org/data/previews/171/171104_2437358-lq.mp3";
const whooshUrl =
  "https://freesound.org/data/previews/343/343130_3248244-lq.mp3";
const impactUrl =
  "https://freesound.org/data/previews/336/336598_5924328-lq.mp3";

export class MedievalSounds {
  constructor() {
    if (typeof Audio === "undefined") {
      this.enabled = false;
      return;
    }
    this.enabled = true;
    this.sword = new Audio(swordUrl);
    this.fire = new Audio(fireUrl);
    this.whooshSound = new Audio(whooshUrl);
    this.impactSound = new Audio(impactUrl);

    const all = [this.sword, this.fire, this.whooshSound, this.impactSound];
    all.forEach((a) => {
      a.volume = 0.7;
    });
  }

  play(audio) {
    if (!this.enabled || !audio) return;
    try {
      audio.currentTime = 0;
      audio.play();
    } catch (e) {
      // ignore autoplay security issues
    }
  }

  swordClash() {
    this.play(this.sword);
  }

  fireLoop() {
    if (!this.enabled) return;
    this.fire.loop = true;
    this.play(this.fire);
  }

  fireStop() {
    if (!this.enabled) return;
    this.fire.pause();
  }

  whoosh() {
    this.play(this.whooshSound);
  }

  impact() {
    this.play(this.impactSound);
  }
}
