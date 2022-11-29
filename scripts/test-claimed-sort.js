const shell = require('shelljs');

const log4js = require('log4js');
logger = log4js.getLogger();
logger.level = "all";

  function itemSort() {
    let items = [];
    items.push({
      id: 1,
      category: "sword",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 1,
      category: "sword",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 1,
      category: "sword",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 1,
      category: "armor",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 1,
      category: "armor",
      lv: "1",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 2,
      category: "armor",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 2,
      category: "armor",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "armor",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 1,
      category: "seed",
      lv: "1",
      image: "",
      strong: true,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 4,
      category: "sword",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "sword",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "sword",
      lv: "1",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "sword",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });

    items.push({
      id: 3,
      category: "armor",
      lv: "2",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "armor",
      lv: "3",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 3,
      category: "armor",
      lv: "1",
      image: "",
      strong: false,
      type: "",
      quantity: "1",
    });

    items.push({
      id: 20,
      category: "seed",
      lv: "1",
      image: "",
      strong: true,
      type: "",
      quantity: "1",
    });
    items.push({
      id: 10,
      category: "seed",
      lv: "1",
      image: "",
      strong: true,
      type: "",
      quantity: "1",
    });

    console.log(items);
    // items = items.sort((a, b) => {
    //   if (a.strong && !b.strong) return 1;
    //   if (!a.strong && b.strong) return -1;
    //   if (a.category !== "seed" && b.category === "seed") return 1;
    //   if (a.category !== "sword" && b.category === "sword") return 1;
    //   if (a.category !== "armor" && b.category === "armor") return 1;
    //   if (Number.parseInt(a.id) > Number.parseInt(b.id)) return 1;
    //   if (Number.parseInt(a.lv) > Number.parseInt(b.lv)) return 1;
    //   return 0;
    // });
    items = items.sort((a, b) => {
      if (a.strong && !b.strong) return -1;
      if (!a.strong && b.strong) return 1;
      if (a.category !== "seed" && b.category === "seed") return 1;
      if (b.category !== "seed" && a.category === "seed") return -1;
      if (a.category !== "sword" && b.category === "sword") return 1;
      if (b.category !== "sword" && a.category === "sword") return -1;
      if (a.category !== "armor" && b.category === "armor") return 1;
      if (b.category !== "armor" && a.category === "armor") return -1;
      if (Number.parseInt(a.id) > Number.parseInt(b.id)) return 1;
      if (Number.parseInt(b.id) > Number.parseInt(a.id)) return -1;
      if (Number.parseInt(a.lv) > Number.parseInt(b.lv)) return -1;
      if (Number.parseInt(b.lv) > Number.parseInt(a.lv)) return 1;
      return 0;
    });
    console.log("==============================================")
    console.log(items);
  }


  const main = async () => {
    itemSort();

  };

  main()
  .then(() => {
    shell.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    shell.exit(1);
  });
