import * as tmi from "tmi.js";
import * as Matter from "matter-js";

const GENERATE_BALLS = false;

enum CollisionGroup {
  Full = 1,
  None = -1,
}

enum CollisionCategory {
  Wall = 101,
  Ball = 102,
  Bullseye = 103,
}

interface Coordinate {
  x: number;
  y: number;
}

const defaultConfig = {
  channelName: "",
  gameTimeoutSeconds: 90,
  entriesPerUser: 1,
  entriesAtOnce: 1,
  targetSize: 240,
  baseBallSize: 40,
  maxBallSize: 60,
};
let config: typeof defaultConfig = {
  ...defaultConfig,
};

const { Engine, Render, Runner, World, Bodies, Composite, Common } = Matter;

let alreadyPlayedPlayers: { [key: string]: number } = {};

let client;

let width = document.body.clientWidth;
let height = document.body.clientHeight;
let widthRatio = 1;
let ballInterval: any;
let gameTimeout: any;
let clickHandler: any;
let balls: Matter.Body[] = [];
let ballUserMap: { [key: string]: string } = {};
let ballImageMap: { [key: string]: string } = {};

// const world = document.querySelector(".faces");

let bullseye: HTMLImageElement;
let bullseyeLocation = {
  x: 0,
  y: 0,
};

let engine = Engine.create({
  gravity: {
    x: 0,
    y: 0,
    scale: 0,
  },
});

const textures = [
  "https://i.ibb.co/z4VSpxG/face-1.png",
  "https://i.ibb.co/cDXgJ6C/face-2.png",
  "https://i.ibb.co/NTPjrhs/face-3.png",
  "https://i.ibb.co/T4rKcVC/face-4.png",
  "https://i.ibb.co/Dw9049M/face-5.png",
  "https://i.ibb.co/gt9BYYQ/face-6.png",
  "https://i.ibb.co/hfys0b2/face-7.png",
  "https://i.ibb.co/zbDfcrh/face-8.png",
  "https://i.ibb.co/6RP73dX/face-9.png",
  "https://i.ibb.co/nns9sKj/face-10.png",
];

function init() {
  console.log("FIRING INIT");

  width = 1920; //document.body.clientWidth;
  height = 1080; //document.body.clientHeight;
  widthRatio = 1920 / document.body.clientWidth;
  let vmin = Math.min(width, height);
  alreadyPlayedPlayers = {};
  balls = [];
  ballUserMap = {};

  cleanupPreviousInit();
  clickHandler = (event: MouseEvent) => {
    if (!gameTimeout) {
      init();
      createGameTimeout();
    }
    const { clientX, clientY } = event;
    const { clientHeight, clientWidth } = document.body;

    // const heightRatio = 1080 / clientHeight;
    console.log(
      { widthRatio, clientX, clientY, clientHeight, clientWidth },
      clientX * widthRatio
    );
    createBall("FOOOO", undefined, clientX * widthRatio, clientY * widthRatio);
  };
  document.addEventListener("click", clickHandler);

  if (!bullseye) {
    const bullseyeElement = document.querySelector(
      ".bullseye"
    ) as HTMLImageElement;
    if (bullseyeElement) {
      bullseye = bullseyeElement;
      bullseye.style.opacity = "1";
    }
  }

  Composite.clear(engine.world, false);
  Engine.clear(engine);
  engine = Engine.create({
    gravity: {
      x: 0,
      y: 0,
      scale: 0,
    },
  });

  let render = Render.create({
    engine: engine,
    canvas: document.querySelector(".faces") as HTMLCanvasElement,
    options: {
      wireframes: false,
      background: "transparent",
      width: width,
      height: height,
    },
  });

  const ORIGINAL_SIZE = 3024;
  const SIZE = config.targetSize;
  const SCALE = SIZE / ORIGINAL_SIZE;
  bullseyeLocation.x = Math.max(
    Math.random() * (width - config.targetSize),
    config.targetSize
  );
  bullseyeLocation.y = Math.max(
    Math.random() * (height - config.targetSize),
    config.targetSize
  );

  Composite.add(engine.world, [
    // top and bottom
    Bodies.rectangle(width / 2, height + 200, width + 400, 400, {
      isStatic: true,
      collisionFilter: {
        group: CollisionGroup.Full,
        mask: CollisionCategory.Ball,
        category: CollisionCategory.Wall,
      },
    }),

    Bodies.rectangle(width / 2, -200, width + 400, 400, {
      isStatic: true,
      collisionFilter: {
        group: CollisionGroup.Full,
        mask: CollisionCategory.Ball,
        category: CollisionCategory.Wall,
      },
    }),

    // side bars
    Bodies.rectangle(-200, height / 2, 400, height, {
      isStatic: true,
      collisionFilter: {
        group: CollisionGroup.Full,
        mask: CollisionCategory.Ball,
        category: CollisionCategory.Wall,
      },
    }),
    Bodies.rectangle(width + 200, height / 2, 400, height, {
      isStatic: true,
      collisionFilter: {
        group: CollisionGroup.Full,
        mask: CollisionCategory.Ball,
        category: CollisionCategory.Wall,
      },
    }),

    // bullseye

    Bodies.circle(bullseyeLocation.x, bullseyeLocation.y, config.targetSize, {
      // angle: Math.PI * (Math.random() * 2 - 1),
      // friction: 0.05,
      // frictionAir: 0.005,
      // frictionStatic: 0.2,
      // density: 0.02,
      // restitution: 0.8,
      // collisionFilter: {
      //   group: CollisionGroup.None,
      //   mask: CollisionCategory.Bullseye,
      //   category: CollisionCategory.Bullseye,
      // },
      render: {
        sprite: {
          texture:
            "https://upload.wikimedia.org/wikipedia/commons/1/17/WA_80_cm_archery_target.svg",
          xScale: SCALE,
          yScale: SCALE,
        },
      },
    }),
  ]);

  Render.run(render);

  var runner = Runner.create();
  Runner.run(runner, engine);
  if (GENERATE_BALLS) {
    ballInterval = setInterval(createBall, 500);
  }
}

function createBall(
  username?: string,
  customImage?: string,
  customX?: number,
  customY?: number
) {
  const ORIGINAL_SIZE = config.maxBallSize;
  const SIZE =
    Math.floor(Math.random() * (config.maxBallSize - config.baseBallSize)) +
    config.baseBallSize;

  const ballImage =
    customImage ?? textures[Math.floor(Math.random() * textures.length)];
  const x = customX ?? Math.random() * document.body.clientWidth;
  const y = customY ?? Math.random() * document.body.clientHeight;
  const random = Math.random();
  const ball = Bodies.circle(x, y, SIZE / 2, {
    // angle: Math.PI * (Math.random() * 2 - 1),
    friction: Math.max(random * 0.04 + 0.01, 0.04),
    frictionAir: Math.max(random * 0.03 + 0.01, 0.03),
    frictionStatic: Math.max(random * 0.2 + 0.1, 0.2),
    density: Math.max(random * 0.14 + 0.08, 0.14),
    restitution: Math.max(random * 0.6 + 0.5, 0.6),
    collisionFilter: {
      group: CollisionGroup.Full,
      mask: CollisionCategory.Ball & CollisionCategory.Wall,
      category: CollisionCategory.Ball,
    },
    render: {
      sprite: {
        texture: ballImage,
        xScale: SIZE / ORIGINAL_SIZE,
        yScale: SIZE / ORIGINAL_SIZE,
      },
    },
  });

  balls.push(ball);
  ballUserMap[ball.id] = username ?? "Unknown User";
  ballImageMap[ball.id] = ballImage;

  Composite.add(engine.world, [ball]);
  const yDistance = bullseyeLocation.y - y;
  const xDistance = bullseyeLocation.x - x;
  const slope = yDistance / xDistance;
  // console.log("bullseye", bullseyeLocation, x, y);
  const distance = getDistance({ x, y }, bullseyeLocation) * widthRatio;
  // console.log({ distance });

  let xModifier = 1;
  let yModifier = 1;
  if (bullseyeLocation.y < y) {
    yModifier = -1;
  }

  if (bullseyeLocation.x < x) {
    xModifier = -1;
  }

  let xAmount = 30;
  let yAmount = slope * xAmount;
  let forceLocationX = x - xAmount * xModifier;
  let b = y - slope * x;
  let forceLocationY = slope * forceLocationX + b;
  if (Math.abs(yDistance) > Math.abs(xDistance)) {
    // console.log("flipping baselines", { xDistance, yDistance });
    yAmount = 30;
    xAmount = yAmount / slope;
    forceLocationY = y - yAmount * yModifier;
    forceLocationX = (b - forceLocationY) / (-1 * slope);
  }

  // console.log({
  //   slope,
  //   b,
  //   x,
  //   y,
  //   xAmount,
  //   yAmount,
  //   forceLocationX,
  //   forceLocationY,
  //   bullseyeLocation,
  // });

  Matter.Body.applyForce(
    ball,
    // { x: forceLocationX, y: forceLocationY },
    { x, y },
    // This is the issue!!!
    {
      x: 0.0005 * distance * (x - forceLocationX), // * xModifier,
      y: 0.0005 * distance * (y - forceLocationY), // * yModifier,
      // x: 0,
      // y: 2,
    }
  );

  // const ballMarker = Bodies.circle(forceLocationX, forceLocationY, 4, {
  //   friction: 0.1,
  //   frictionAir: 0.02,
  //   frictionStatic: 0.2,
  //   density: 0.03,
  //   restitution: 1,
  //   render: {
  //     fillStyle: "red",
  //   },
  //   collisionFilter: {
  //     group: 1,
  //   },
  // });

  // Composite.add(engine.world, [ballMarker]);

  // setTimeout(() => {
  //   Composite.remove(engine.world, ball);
  // }, 60000);

  return ball;
}

if ((module as any).hot) {
  (module as any).hot.dispose(function() {
    if (ballInterval) {
      clearInterval(ballInterval);
    }
    if (gameTimeout) {
      clearTimeout(gameTimeout);
    }
  });
}

function cleanupPreviousInit() {
  if (ballInterval) {
    clearInterval(ballInterval);
  }

  if (clickHandler) {
    document.removeEventListener("click", clickHandler);
  }
}

function getDistance(start: Coordinate, finish: Coordinate) {
  return Math.sqrt(
    Math.pow(finish.y - start.y, 2) + Math.pow(finish.x - start.x, 2)
  );
}

let resultsElement: HTMLElement | null;
let resultsImageElement: HTMLImageElement | null;
let resultsTitleElement: HTMLElement | null;
let resultsScoreElement: HTMLElement | null;
let resultsWinnerElement: HTMLElement | null;

setTimeout(() => {
  resultsElement = document.querySelector(".results");
  resultsImageElement = document.querySelector(".results-image");
  resultsTitleElement = document.querySelector(".results-title");
  resultsScoreElement = document.querySelector(".results-score");
  resultsWinnerElement = document.querySelector(".results-winner");

  const url = new URL(document.location.href);
  const queryParams = new URLSearchParams(url.search);

  queryParams.forEach((value, key) => {
    (config as any)[key] = value;
    if (key !== "channelName") {
      (config as any)[key] = parseInt(value);
    }
  });

  console.log({ config });

  subscribeToChat();
}, 3000);

function getWinner() {
  let winner = "";
  let highestScore = 0;
  let image = "";
  balls.forEach((ball) => {
    const distance = Math.sqrt(
      Math.pow(bullseyeLocation.x - ball.position.x, 2) +
        Math.pow(bullseyeLocation.y - ball.position.y, 2)
    );

    const score = 100 - (distance / (config.targetSize / 2)) * 100;
    if (score > highestScore) {
      highestScore = score;
      winner = ballUserMap[ball.id];
      image = ballImageMap[ball.id];
    }
  });

  return { winner, score: highestScore, image };
}

function subscribeToChat() {
  client = new tmi.Client({
    options: { debug: true },
    channels: [config.channelName],
  });
  client.connect().catch(console.error);
  client.on(
    "message",
    (channel: string, tags: any, message: string, self: boolean) => {
      if (self) return;

      if (message.toLowerCase().indexOf("!flick") === 0) {
        if (!gameTimeout) {
          init();
          createGameTimeout();
        }

        if (config.entriesPerUser) {
          if (!alreadyPlayedPlayers[tags["user-id"]]) {
            alreadyPlayedPlayers[tags["user-id"]] = 1;
          } else {
            alreadyPlayedPlayers[tags["user-id"]] =
              alreadyPlayedPlayers[tags["user-id"]] + 1;
          }

          if (alreadyPlayedPlayers[tags["user-id"]] > config.entriesPerUser) {
            // bail because user is over quota
            return;
          }
        }

        let emoteImage: string;
        if (tags.emotes) {
          let flickedBalls = 0;
          Object.keys(tags.emotes).forEach((emote: any) => {
            tags.emotes[emote].forEach(() => {
              if (flickedBalls < config.entriesAtOnce) {
                emoteImage = `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/light/3.0`;
                createBall(tags.username, emoteImage);
                flickedBalls += 1;
              }
            });
          });
        } else {
          createBall(tags.username);
        }
      }
    }
  );
}

function createGameTimeout() {
  gameTimeout = setTimeout(() => {
    //set results values
    if (
      resultsElement &&
      resultsImageElement &&
      resultsTitleElement &&
      resultsScoreElement &&
      resultsWinnerElement
    ) {
      const { winner, score, image } = getWinner();
      if (score > 0) {
        resultsImageElement.src = image;
        resultsTitleElement.innerText = "WINNER!!";
        resultsScoreElement.innerText =
          score % 1 > 0 ? score.toFixed(2) : score.toString();
        resultsWinnerElement.innerText = winner;

        setTimeout(() => {
          if (resultsElement) {
            resultsElement.style.opacity = "0";
            Composite.clear(engine.world, false);
            Engine.clear(engine);
            gameTimeout = undefined;
          }
        }, 10000);
        resultsElement.style.opacity = "1";
      } else {
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        gameTimeout = undefined;
      }
    }
  }, 1000 * config.gameTimeoutSeconds);
}
