class RunChecker {
  #lastUpdate: number = Date.now();
  #timerDelay: number = 0;

  constructor(timerDelay: number) {
    this.#timerDelay = timerDelay;
  }

  set timerDelay(timerDelay: number) {
    this.#timerDelay = timerDelay;
  }

  resetTimer = () => {
    this.#lastUpdate = Date.now();
  };

  canRun = () => {
    const canRun = Date.now() - this.#lastUpdate > this.#timerDelay;
    if (!canRun) return false;

    this.#lastUpdate = Date.now();
    return true;
  };
}

export default RunChecker;
