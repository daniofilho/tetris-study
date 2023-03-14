/*const prepareRunChecker = (timerDelay: number) => {
  let lastEvent = Date.now();

  return {
    shouldRun() {
      const result = Date.now() - lastEvent > timerDelay;
      if (result) lastEvent = Date.now();

      return result;
    },
  };
};*/

const prepareRunChecker = (timerDelay: number) => {
  let lastEvent = Date.now();

  const result = Date.now() - lastEvent > timerDelay;
  if (result) lastEvent = Date.now();

  return result;
};

export default prepareRunChecker;
