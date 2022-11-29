const shell = require('shelljs');

const log4js = require('log4js');
logger = log4js.getLogger();
logger.level = "all";

  function getWeaponTime() {
    // if (!props.regionInfos || !props.regionInfos.WeaponInterval) {
    //   return "--:--";
    // }
    const WeaponInterval = "14400";
    // const clameTimes = "1659456185";
    const clameTimes = "1659508000";

    // console.log((Math.round(Date.now() / 1000) - Number.parseInt(clameTimes)));
    // console.log(((Math.round(Date.now() / 1000) - Number.parseInt(clameTimes)) / Number.parseInt(WeaponInterval)));
    // console.log(((Math.round(Date.now() / 1000) - Number.parseInt(clameTimes)) % Number.parseInt(WeaponInterval)));
    // console.log(((Math.round(Date.now() / 1000) - Number.parseInt(clameTimes)) % Number.parseInt(WeaponInterval)) / 3600);
    // console.log((((Math.round(Date.now() / 1000) - Number.parseInt(clameTimes)) % Number.parseInt(WeaponInterval)) % 3600) / 60);

    const elapsedTime = Math.round(Date.now() / 1000) - Number.parseInt(clameTimes);
    console.log(elapsedTime);
    const intervalRemainingTime = Number.parseInt(WeaponInterval) -
      (elapsedTime % Number.parseInt(WeaponInterval));
    console.log(intervalRemainingTime);
    console.log(intervalRemainingTime / 3600);
    console.log((intervalRemainingTime % 3600) / 60);

    const hour = Math.floor(intervalRemainingTime / 3600);
    console.log(hour);
    const min = Math.floor((intervalRemainingTime % 3600) / 60);
    console.log(min);

    return `${("00" + hour).slice(-2)}:${("00" + min).slice(-2)}`;
  }

  function getSeedTime() {
    // if (!props.regionInfos || !props.regionInfos.WeaponInterval) {
    //   return "--:--";
    // }
    const SeedInterval = "82800";
    // const clameTimes = "1659456185";
    const clameTimes = "1659508000";

    const elapsedTime = Math.round(Date.now() / 1000) - Number.parseInt(clameTimes);
    if(elapsedTime >= Number.parseInt(SeedInterval)) {
      return "Chance";
    }

    const hour = Math.floor(
      (Number.parseInt(SeedInterval) -
        (Math.round(Date.now() / 1000) -
          Number.parseInt(clameTimes))) /
        3600
    );
    const min = Math.floor(
      ((Number.parseInt(SeedInterval) -
        (Math.round(Date.now() / 1000) -
          Number.parseInt(clameTimes))) %
        3600) /
        60
    );

    return `${("00" + hour).slice(-2)}:${("00" + min).slice(-2)}`;
  }

  const main = async () => {
    // console.log(Date.now());
    // console.log(Date.now() / 1000);
    // console.log(Math.round(Date.now() / 1000));
    console.log(getWeaponTime());
    console.log(getSeedTime());

  };

  main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
