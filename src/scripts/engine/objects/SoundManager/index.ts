import { Howl } from 'howler';

import clearLineMP3 from '../../../../assets/sounds/clear-line.mp3';
import gameOverMP3 from '../../../../assets/sounds/game-over.mp3';
import levelUpMP3 from '../../../../assets/sounds/level-up.mp3';
import soundtrackMP3 from '../../../../assets/sounds/soundtrack.mp3';
import ingameMP3 from '../../../../assets/sounds/ingame.mp3';

class SoundManager {
  clearLineSound?: Howl;
  gameOverSound?: Howl;
  levelUpSound?: Howl;
  soundtrackSound?: Howl;
  ingameSound?: Howl;

  constructor() {
    this.clearLineSound = new Howl({
      src: [clearLineMP3],
    });

    this.gameOverSound = new Howl({
      src: [gameOverMP3],
    });

    this.levelUpSound = new Howl({
      src: [levelUpMP3],
    });

    this.soundtrackSound = new Howl({
      src: [soundtrackMP3],
      volume: 0.5,
      loop: true,
    });

    this.ingameSound = new Howl({
      src: [ingameMP3],
      volume: 0.5,
      loop: true,
    });
  }
}

export default SoundManager;
