const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const imagePaths = {
    maze: "maze.png",
    sprites: "sprites.png",
    text: "text.png"
};

const images = {};

const Color = {
    White: 0,
    Red: 1,
    Pink: 2,
    Blue: 3,
    Orange: 4,
    Beige: 5,
    Yellow: 6
};

const soundPaths = {
    intro: "pacman_beginning.wav",
    chomp1: "pacman_chomp1.wav",
    chomp2: "pacman_chomp2.wav",
    // siren: "",
    death: "pacman_death.wav",
    eatGhost: "pacman_eatghost.wav",
    blueGhosts: "ghosts_blue.wav"
};

const sounds = {};

function loadImage(key, src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            images[key] = img;
            resolve();
        };
        img.onerror = reject;
        img.src = src;
    });
}

async function loadAllImages() {
    const promises = Object.entries(imagePaths).map(([key, src]) => loadImage(key, src));
    await Promise.all(promises);
}

async function loadSound(key, src) {
  const res = await fetch(src);
  const arrayBuffer = await res.arrayBuffer();
  sounds[key] = await audioCtx.decodeAudioData(arrayBuffer);
}

async function loadAllSounds() {
    const promises = Object.entries(soundPaths).map(([key, src]) => loadSound(key, src));
    await Promise.all(promises);
}

async function loadAllAssets() {
    await Promise.all([loadAllImages(), loadAllSounds()]);
}

const MoveSpeed = 5;
const AnimationSpeed = 8;

const TileSize = 8;
const SpriteSize = 16;
const TextSize = 8;

const TileWidth = 28;
const TileHeight = 36;

const TileMap = [
    44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44,
     1, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 43, 42, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,  0,
     3, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45,  2,
     3, 45, 23, 14, 14, 22, 45, 23, 14, 14, 14, 22, 45, 25, 24, 45, 23, 14, 14, 14, 22, 45, 23, 14, 14, 22, 45,  2,
     3, 47, 25, 44, 44, 24, 45, 25, 44, 44, 44, 24, 45, 25, 24, 45, 25, 44, 44, 44, 24, 45, 25, 44, 44, 24, 47,  2,
     3, 45, 27, 20, 20, 26, 45, 27, 20, 20, 20, 26, 45, 27, 26, 45, 27, 20, 20, 20, 26, 45, 27, 20, 20, 26, 45,  2,
     3, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45,  2,
     3, 45, 23, 14, 14, 22, 45, 23, 22, 45, 23, 14, 14, 14, 14, 14, 14, 22, 45, 23, 22, 45, 23, 14, 14, 22, 45,  2,
     3, 45, 27, 20, 20, 26, 45, 25, 24, 45, 27, 20, 20, 35, 34, 20, 20, 26, 45, 25, 24, 45, 27, 20, 20, 26, 45,  2,
     3, 45, 45, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 45, 45,  2,
     5, 12, 12, 12, 12, 22, 45, 25, 36, 14, 14, 22, 44, 25, 24, 44, 23, 14, 14, 37, 24, 45, 23, 12, 12, 12, 12,  4,
    44, 44, 44, 44, 44,  3, 45, 25, 34, 20, 20, 26, 44, 27, 26, 44, 27, 20, 20, 35, 24, 45,  2, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44,  3, 45, 25, 24, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 25, 24, 45,  2, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44,  3, 45, 25, 24, 44, 29, 12, 33, 44, 44, 32, 12, 28, 44, 25, 24, 45,  2, 44, 44, 44, 44, 44,
    10, 10, 10, 10, 10, 26, 45, 27, 26, 44,  2, 44, 44, 44, 44, 44, 44,  3, 44, 27, 26, 45, 27, 10, 10, 10, 10, 10,
    44, 44, 44, 44, 44, 44, 45, 44, 44, 44,  2, 44, 44, 44, 44, 44, 44,  3, 44, 44, 44, 45, 44, 44, 44, 44, 44, 44,
    12, 12, 12, 12, 12, 22, 45, 23, 22, 44,  2, 44, 44, 44, 44, 44, 44,  3, 44, 23, 22, 45, 23, 12, 12, 12, 12, 12,
    44, 44, 44, 44, 44,  3, 45, 25, 24, 44, 31, 10, 10, 10, 10, 10, 10, 30, 44, 25, 24, 45,  2, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44,  3, 45, 25, 24, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 25, 24, 45,  2, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44,  3, 45, 25, 24, 44, 23, 14, 14, 14, 14, 14, 14, 22, 44, 25, 24, 45,  2, 44, 44, 44, 44, 44,
     1, 10, 10, 10, 10, 26, 45, 27, 26, 44, 27, 20, 20, 35, 34, 20, 20, 26, 44, 27, 26, 45, 27, 10, 10, 10, 10,  0,
     3, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45,  2,
     3, 45, 23, 14, 14, 22, 45, 23, 14, 14, 14, 22, 45, 25, 24, 45, 23, 14, 14, 14, 22, 45, 23, 14, 14, 22, 45,  2,
     3, 45, 27, 20, 35, 24, 45, 27, 20, 20, 20, 26, 45, 27, 26, 45, 27, 20, 20, 20, 26, 45, 25, 34, 20, 26, 45,  2,
     3, 47, 45, 45, 25, 24, 45, 45, 45, 45, 45, 45, 45, 44, 44, 45, 45, 45, 45, 45, 45, 45, 25, 24, 45, 45, 47,  2,
     7, 14, 22, 45, 25, 24, 45, 23, 22, 45, 23, 14, 14, 14, 14, 14, 14, 22, 45, 23, 22, 45, 25, 24, 45, 23, 14,  6,
     9, 20, 26, 45, 27, 26, 45, 25, 24, 45, 27, 20, 20, 35, 34, 20, 20, 26, 45, 25, 24, 45, 27, 26, 45, 27, 20,  8,
     3, 45, 45, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 25, 24, 45, 45, 45, 45, 45, 45,  2,
     3, 45, 23, 14, 14, 14, 14, 37, 36, 14, 14, 22, 45, 25, 24, 45, 23, 14, 14, 37, 36, 14, 14, 14, 14, 22, 45,  2,
     3, 45, 27, 20, 20, 20, 20, 20, 20, 20, 20, 26, 45, 27, 26, 45, 27, 20, 20, 20, 20, 20, 20, 20, 20, 26, 45,  2,
     3, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45,  2,
     5, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,  4,
    44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44,
    44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44
];

let Maze = TileMap.slice();

const Direction = {
    Right: 0,
    Left: 1,
    Up: 2,
    Down: 3
};

const DirVector = {
    [Direction.Right]: { x: 1, y: 0 },
    [Direction.Left]: { x: -1, y: 0 },
    [Direction.Up]: { x: 0, y: -1 },
    [Direction.Down]: { x: 0, y: 1 }
};

const oppositeDir = {
    [Direction.Right]: Direction.Left,
    [Direction.Left]: Direction.Right,
    [Direction.Up]: Direction.Down,
    [Direction.Down]: Direction.Up
};

const PacmanSpawnX = TileWidth / 2;
const PacmanSpawnY = 26.5;

let pacman = {
    x: PacmanSpawnX,
    y: PacmanSpawnY,
    dir: Direction.Left,
    desiredDir: Direction.Left,
    dying: false,
    animation: 0, // 0 - full, 1 - open, 2 - wide
    animationDir: 1,
    SpawnX: PacmanSpawnX,
    SpawnY: PacmanSpawnY,
    SpawnDir: Direction.Left
};

const GhostState = {
    Locked: 0,
    Escaping: 1,
    Free: 2,
    Eaten: 4
};

const FrightenedTime = 8;

const GhostStartX = TileWidth / 2;
const GhostStartY = 14.5;

const BlinkySpawnX = GhostStartX;
const BlinkySpawnY = GhostStartY;

let blinky = {
    name: "Blinky",
    x: BlinkySpawnX,
    y: BlinkySpawnY,
    dir: Direction.Left,
    animation: 0,
    ScatterX: 25,
    ScatterY: 0,
    SpawnX: BlinkySpawnX,
    SpawnY: BlinkySpawnY,
    SpawnDir: Direction.Left,
    state: GhostState.Free,
    timer: 0
};

const PinkySpawnX = TileWidth / 2;
const PinkySpawnY = 17.5;

let pinky = {
    name: "Pinky",
    x: PinkySpawnX,
    y: PinkySpawnY,
    dir: Direction.Left,
    animation: 0,
    ScatterX: 2,
    ScatterY: 0,
    SpawnX: PinkySpawnX,
    SpawnY: PinkySpawnY,
    SpawnDir: Direction.Down,
    state: GhostState.Escaping,
    timer: 0
};

const InkySpawnX = TileWidth / 2 - 2;
const InkySpawnY = 17.5;

let inky = {
    name: "Inky",
    x: InkySpawnX,
    y: InkySpawnY,
    dir: Direction.Left,
    animation: 0,
    ScatterX: 27,
    ScatterY: 35,
    SpawnX: InkySpawnX,
    SpawnY: InkySpawnY,
    SpawnDir: Direction.Up,
    state: GhostState.Locked,
    timer: 0
};

const ClydeSpawnX = TileWidth / 2 + 2;
const ClydeSpawnY = 17.5;

let clyde = {
    name: "Clyde",
    x: ClydeSpawnX,
    y: ClydeSpawnY,
    dir: Direction.Left,
    animation: 0,
    ScatterX: 0,
    ScatterY: 35,
    SpawnX: ClydeSpawnX,
    SpawnY: ClydeSpawnY,
    SpawnDir: Direction.Up,
    state: GhostState.Locked,
    timer: 0
};

const ghosts = [blinky, pinky, inky, clyde];

const GhostMode = {
    Chase: 0,
    Scatter: 1
};

const ModeSchedule = [
    { mode: GhostMode.Scatter, time: 7 },
    { mode: GhostMode.Chase, time: 20 },
    { mode: GhostMode.Scatter, time: 7 },
    { mode: GhostMode.Chase, time: 20 },
    { mode: GhostMode.Scatter, time: 5 },
    { mode: GhostMode.Chase, time: 20 },
    { mode: GhostMode.Scatter, time: 5 },
    { mode: GhostMode.Chase, time: Infinity }
];

let modeIdx = 0;
let time = 0;
let ghostMode = ModeSchedule[modeIdx].mode;

let MaxDots = 240;
let MaxBigDots = 4;
let AllDots = MaxDots + MaxBigDots;
let dots = 0;
let score = 0;
let lives = 5;

let countdown = 2;
let start = false;
let ready = true;
let gameover = false;
let gamewon = false;
let showGhosts = true;

function getCurrentMode() {
    return ModeSchedule[modeIdx].mode;
}

function makeBlackTransparent(image) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = image.width;
    offCanvas.height = image.height;
    const ctx = offCanvas.getContext("2d");

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r + g + b === 0) {
            data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    return offCanvas;
}

function drawText(text, tileX, tileY, color=Color.White) {
    for (const letter of text) {
        if (letter === " ") {
            tileX += 1;
            continue;
        }
        let ascii;
        if (letter === "!") {
            ascii = "Z".charCodeAt(0) - "A".charCodeAt(0) + 1;
        }
        else {
            ascii = letter.charCodeAt(0) - "A".charCodeAt(0);
        }

        let textX = ascii % 15;
        let textY = Math.floor(ascii / 15);

        ctx.drawImage(images.text, textX * TextSize, (color * 4 + textY) * TextSize, TextSize, TextSize,
                      tileX * TileSize, tileY * TileSize, TileSize, TileSize);
        tileX += 1;
    }
}

function drawNumber(number, tileX, tileY, color=Color.White) {
    if (number === 0) {
        ctx.drawImage(images.text, 0, 2 * TextSize, TextSize, TextSize,
                      tileX * TileSize, tileY * TileSize, TileSize, TileSize);
    }
    while (number !== 0) {
        digit = number % 10;
        number = Math.floor(number / 10);

        ctx.drawImage(images.text, digit * TextSize, 2 * TextSize, TextSize, TextSize,
                      tileX * TileSize, tileY * TileSize, TileSize, TileSize);
        tileX -= 1;
    }
}

function playSound(buffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}

let last = performance.now();
// Game loop
function gameLoop(now) {
    let dt = (now - last) / 1000;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    modeIdx = 0;
    time = 0;
    pacman.dir = Direction.Left;
    pacman.desiredDir = Direction.Left;
    pacman.x = pacman.SpawnX;
    pacman.y = pacman.SpawnY;
    pacman.animation = 0;

    for (const ghost of ghosts) {
        ghost.x = ghost.SpawnX;
        ghost.y = ghost.SpawnY;
        ghost.dir = ghost.SpawnDir;
        ghost.animation = 0;
        ghost.timer = 0;
    }

    blinky.state = GhostState.Free;
    pinky.state = GhostState.Escaping;
    inky.state = GhostState.Locked;
    clyde.state = GhostState.Locked;
}

function restartMaze() {
    Maze = TileMap.slice();
}

function isWall(tileX, tileY, eaten=false) {
    return Maze[tileY * TileWidth + tileX] < 44 || (!eaten && tileY === 15 && (tileX === 13 || tileX === 14));
}

function isDirHorizontal(dir) {
    return dir <= Direction.Left;
}

function isSameAxis(dirA, dirB) {
    return isDirHorizontal(dirA) === isDirHorizontal(dirB);
}

function update(dt) {
    if (!start) return;
    if (countdown > 0) {
        countdown -= dt;
        return;
    }
    if (pacman.dying && pacman.animation === 0) {
        playSound(sounds.death);
        showGhosts = false;
    }

    if (gameover && !pacman.dying) {
        gameover = false;
        restartGame();
        ready = true;
        showGhosts = true;
        countdown = 2;

        if (lives === 0 || gamewon) {
            restartMaze();
            start = false;
            countdown = 4;
            lives = 5;
        }
        gamewon = false;
        return;
    }
    if (ready) {
        lives -= 1;
        ready = false;
    }

    if (!pacman.dying) {
        time += dt;
        if (time >= ModeSchedule[modeIdx].time) {
            time -= ModeSchedule[modeIdx].time;
            modeIdx += 1;
        }

        // movement
        // pacman
        // const moveAmount = MoveSpeed * dt;
        const moveAmount = MoveSpeed * 0.016;
        const tileX = Math.floor(pacman.x);
        const tileY = Math.floor(pacman.y);
        const offsetX = pacman.x - tileX;
        const offsetY = pacman.y - tileY;

        if (isSameAxis(pacman.dir, pacman.desiredDir))
            pacman.dir = pacman.desiredDir;

        const moveVec = DirVector[pacman.dir];
        const newPos = {
            x: pacman.x + moveVec.x * moveAmount,
            y: pacman.y + moveVec.y * moveAmount
        };
        const nextTile = {
            x: tileX + moveVec.x,
            y: tileY + moveVec.y
        };

        if (tileX >= TileWidth - 1 || tileX <= 0) {
            pacman.x = newPos.x;
            pacman.y = newPos.y;
        }
        else {
            let changedDir = false;
            if (!isSameAxis(pacman.desiredDir, pacman.dir)) {
                const turnVec = DirVector[pacman.desiredDir];
                const tileAfterTurn = {
                    x: tileX + turnVec.x,
                    y: tileY + turnVec.y
                }
                if (!isWall(tileAfterTurn.x, tileAfterTurn.y)) {
                    if (isDirHorizontal(pacman.dir)) {
                        let leftBound = pacman.x - Math.floor(pacman.x);
                        let rightBound = newPos.x - Math.floor(newPos.x);
                        let overshoot = rightBound;

                        if (leftBound > rightBound)
                            [leftBound, rightBound] = [rightBound, leftBound]
                        if (leftBound <= 0.5 && rightBound >= 0.5) {
                            pacman.dir = pacman.desiredDir;
                            pacman.x = tileX + 0.5;
                            pacman.y += turnVec.y * Math.abs(overshoot - 0.5); // distance correction
                            changedDir = true;
                        }
                    }
                    else {
                        let leftBound = pacman.y - Math.floor(pacman.y);
                        let rightBound = newPos.y - Math.floor(newPos.y);
                        const overshoot = rightBound;

                        if (leftBound > rightBound)
                            [leftBound, rightBound] = [rightBound, leftBound]
                        if (leftBound <= 0.5 && rightBound >= 0.5) {
                            pacman.dir = pacman.desiredDir;
                            pacman.y = tileY + 0.5;
                            pacman.x += turnVec.x * Math.abs(overshoot - 0.5); // distance correction
                            changedDir = true;
                        }
                    }
                }
            }

            if (!changedDir) {
                if (isWall(nextTile.x, nextTile.y) &&
                    Math.abs(nextTile.x + 0.5 - newPos.x) + Math.abs(nextTile.y + 0.5 - newPos.y) < 1) {
                    pacman.x = tileX + 0.5;
                    pacman.y = tileY + 0.5;
                }
                else {
                    pacman.x = newPos.x;
                    pacman.y = newPos.y;
                }
            }
        }

        if (pacman.x > TileWidth + 0.5) {
            pacman.x = -0.5;
        }
        else if (pacman.x < -0.5) {
            pacman.x = TileWidth + 0.5;
        }

        if (pacman.x >= 0 && pacman.x < TileWidth) {
            const newTileX = Math.floor(pacman.x);
            const newTileY = Math.floor(pacman.y);
            let dotEaten = false;
            if (Maze[newTileY * TileWidth + newTileX] === 45) // new tile is dot
            {
                Maze[newTileY * TileWidth + newTileX] = 44;
                score += 1;
                dots++;
                dotEaten = true;
            }
            else if (Maze[newTileY * TileWidth + newTileX] === 47) // new tile is big dot
            {
                Maze[newTileY * TileWidth + newTileX] = 44;
                score += 5;
                dots++;
                dotEaten = true;
                for (const ghost of ghosts) {
                    if (ghost.state !== GhostState.Eaten)
                        ghost.timer = FrightenedTime;
                }
            }

            if (dotEaten) {
                if (dots % 2 == 0) {
                    playSound(sounds.chomp1);
                }
                else {
                    playSound(sounds.chomp2);
                }

                let completion = dots / AllDots;
                if (completion === 1) {
                    countdown = 2;
                    pacman.animation = 0;
                    gameover = true;
                    gamewon = true;
                }
                else if (clyde.state === GhostState.Locked && completion > (1 / 3)) {
                    clyde.state = GhostState.Escaping;
                }
                else if (inky.state === GhostState.Locked && completion > (1 / 4)) {
                    inky.state = GhostState.Escaping;
                }
            }
        }

        const PacmanTileX = Math.floor(pacman.x);
        const PacmanTileY = Math.floor(pacman.y);
        const PacmanVec = DirVector[pacman.dir];
        // ghosts
        for (let ghost of ghosts) {
            if (ghost.timer > 0) {
                ghost.timer -= dt;
            }

            if (ghost.state === GhostState.Escaping) {
                const startVecX = GhostStartX - ghost.x;
                const startVecY = GhostStartY - ghost.y;
                if (startVecX !== 0) {
                    const sign = Math.sign(startVecX);
                    ghost.x += moveAmount * sign / 4;
                    if ((startVecX > 0 && ghost.x > GhostStartX) || (startVecX < 0 && ghost.x < GhostStartX)) {
                        const overshoot = Math.abs(ghost.x - GhostStartX);
                        ghost.x = GhostStartX;
                        ghost.y -= overshoot;
                    }
                }
                else {
                    ghost.y -= moveAmount / 4;
                    if (ghost.y <= GhostStartY) {
                        ghost.y = GhostStartY;
                        ghost.state = GhostState.Free;
                        ghost.dir = Direction.Left;
                    }
                }
                continue;
            }

            const tile = {
                x: Math.floor(ghost.x),
                y: Math.floor(ghost.y)
            };
            const vec = DirVector[ghost.dir];
            const nextTile = {
                x: tile.x + vec.x,
                y: tile.y + vec.y
            };
            const newPos = {
                x: ghost.x + moveAmount * vec.x,
                y: ghost.y + moveAmount * vec.y
            }

            if (ghost.state === GhostState.Locked) {
                if (isWall(nextTile.x, nextTile.y)) {
                    if (isDirHorizontal(ghost.dir))
                        ghost.x = tile.x + 0.5;
                    else
                        ghost.y = tile.y + 0.5;
                    const overshoot = Math.abs(newPos.x - ghost.x) + Math.abs(newPos.y - ghost.y);
                    ghost.dir = oppositeDir[ghost.dir];
                    const newVec = DirVector[ghost.dir];
                    ghost.x += overshoot * newVec.x;
                    ghost.y += overshoot * newVec.y;
                }
                else {
                    ghost.x = newPos.x;
                    ghost.y = newPos.y;
                }
                continue;
            }

            if (tile.x === -1 || tile.x === 28) {
                ghost.x = newPos.x;
                ghost.y = newPos.y;
                if (ghost.x > 28.5)
                    ghost.x = -0.5;
                else if (ghost.x < -0.5)
                    ghost.x = 28.5;
                continue;
            }

            const turns = [];
            const isEaten = ghost.state === GhostState.Eaten;

            for (const dir of Object.values(Direction)) {
                if (dir === oppositeDir[ghost.dir]) continue;
                const newVec = DirVector[dir];
                const newTileX = tile.x + newVec.x;
                const newTileY = tile.y + newVec.y;
                if (!isWall(newTileX, newTileY, isEaten))
                    turns.push({ x: newTileX, y: newTileY, dir });
            }

            let leftBound = ghost.x;
            let rightBound = newPos.x;
            if (leftBound > rightBound)
                [leftBound, rightBound] = [rightBound, leftBound];

            let upperBound = ghost.y;
            let lowerBound = newPos.y;
            if (upperBound > lowerBound)
                [upperBound, lowerBound] = [lowerBound, upperBound];

            const horizontally = leftBound <= tile.x + 0.5 && rightBound >= tile.x + 0.5;
            const vertically = upperBound <= tile.y + 0.5 && lowerBound >= tile.y + 0.5;

            if (horizontally && vertically) {
                if (turns.length > 1) {
                    const targetTile = {
                        x: PacmanTileX,
                        y: PacmanTileY
                    };

                    function getDistance(nodeA, nodeB) {
                        return Math.abs(nodeB.x - nodeA.x) + Math.abs(nodeB.y - nodeA.y);
                    }

                    if (ghost.timer > 0) {
                        ghost.dir = turns[Math.floor(Math.random() * turns.length)].dir;
                    }
                    else {
                        const isScatter = getCurrentMode() === GhostMode.Scatter;
                        // pathfinding
                        if (isEaten) {
                            if (ghost.name === "Blinky") {
                                targetTile.x = Math.floor(pinky.SpawnX);
                                targetTile.y = Math.floor(pinky.SpawnY);
                            }
                            else {
                                targetTile.x = Math.floor(ghost.SpawnX);
                                targetTile.y = Math.floor(ghost.SpawnY);
                            }
                        }
                        else if (isScatter) {
                            targetTile.x = ghost.ScatterX;
                            targetTile.y = ghost.ScatterY;
                        }
                        else {
                            switch (ghost.name) {
                                case "Blinky":
                                    break;
                                case "Pinky": {
                                    targetTile.x += 4 * PacmanVec.x;
                                    targetTile.y += 4 * PacmanVec.y;
                                }
                                break;
                                case "Inky": {
                                    targetTile.x += 2 * PacmanVec.x;
                                    targetTile.y += 2 * PacmanVec.y;
                                    const blinkyX = Math.floor(blinky.x);
                                    const blinkyY = Math.floor(blinky.y);
                                    const blinkyVec = {
                                        x: targetTile.x - blinkyX,
                                        y: targetTile.y - blinkyY
                                    };
                                    targetTile.x = blinkyX + blinkyVec.x * 2;
                                    targetTile.y = blinkyY + blinkyVec.y * 2;
                                }
                                break;
                                case "Clyde": {
                                    const clydeX = Math.floor(clyde.x);
                                    const clydeY = Math.floor(clyde.y);
                                    const distance = Math.abs(PacmanTileX - clydeX) + Math.abs(PacmanTileY - clydeY);

                                    if (distance < 8) {
                                        targetTile.x = clyde.ScatterX;
                                        targetTile.y = clyde.ScatterY;
                                    }
                                }
                                break;
                            }
                        }

                        function createNode(x, y, dir) {
                            return { x, y, dir };
                        }

                        function addNode(node) {
                            visited.add(`${node.x},${node.y}`);
                        }

                        function isNodeVisited(node) {
                            return visited.has(`${node.x},${node.y}`);
                        }

                        const queue = turns;
                        const visited = new Set();
                        let chaseDir = null;
                        let closestDst = Infinity;
                        let closestNode = createNode(tile.x, tile.y, ghost.dir);

                        addNode(tile);
                        while (queue.length) {
                            const node = queue.shift();
                            if (isNodeVisited(node)) continue;
                            addNode(node);

                            if (node.x === targetTile.x && node.y === targetTile.y) {
                                chaseDir = node.dir;
                                break;
                            }
                            else if (getDistance(node, targetTile) < closestDst) {
                                closestNode = node;
                                closestDst = getDistance(node, targetTile);
                            }

                            if (node.y === 17) {
                                if (node.x === -1) {
                                    const newNode = createNode(27, node.y, node.dir);
                                    queue.push(newNode);
                                    continue;
                                }
                                else if (node.x === 28) {
                                    const newNode = createNode(0, node.y, node.dir);
                                    queue.push(newNode);
                                    continue;
                                }
                            }

                            for (const vec of Object.values(DirVector)) {
                                const newNode = createNode(node.x + vec.x, node.y + vec.y, node.dir);
                                if ((newNode.y === 17 && (newNode.x === -1 || newNode.x === 28)) || !isWall(newNode.x, newNode.y, isEaten))
                                    queue.push(newNode);
                            }
                        }

                        if (chaseDir)
                            ghost.dir = chaseDir;
                        else
                            ghost.dir = closestNode.dir;
                    }
                    // else {
                    //     const scatterTile = { x: ghost.ScatterX, y: ghost.ScatterY };
                    //     const horizontalPref = Math.abs(scatterTile.x - ghost.x) > Math.abs(scatterTile.y - ghost.y);
                    //     const ghostDst = getDistance(tile, scatterTile);
                    //     let closestDst = Infinity;
                    //     let closestNode = null;
                    //     for (const node of turns) {
                    //         if (getDistance(node, scatterTile) <= closestDst) {
                    //             if (getDistance(node, scatterTile) === closestDst) {
                    //                 if (closestDst < ghostDst) {
                    //                     if (!(horizontalPref ^ isDirHorizontal(node.dir))) {
                    //                         closestDst = getDistance(node, scatterTile);
                    //                         closestNode = node;
                    //                     }
                    //                 }
                    //                 else {
                    //                     if (!(!horizontalPref ^ isDirHorizontal(node.dir))) {
                    //                         closestDst = getDistance(node, scatterTile);
                    //                         closestNode = node;
                    //                     }
                    //                 }
                    //             }
                    //             else {
                    //                 closestDst = getDistance(node, scatterTile);
                    //                 closestNode = node;
                    //             }
                    //         }
                    //     }
                    //     ghost.dir = closestNode.dir;
                    // }

                    ghost.x = tile.x + 0.5;
                    ghost.y = tile.y + 0.5;
                    const overshoot = Math.abs(newPos.x - ghost.x) + Math.abs(newPos.y - ghost.y);
                    const newVec = DirVector[ghost.dir];
                    ghost.x += overshoot * newVec.x;
                    ghost.y += overshoot * newVec.y;
                }
                else if (nextTile.x < 28 && nextTile.x >= 0 && isWall(nextTile.x, nextTile.y)) {
                    ghost.x = tile.x + 0.5;
                    ghost.y = tile.y + 0.5;
                    const overshoot = Math.abs(newPos.x - ghost.x) + Math.abs(newPos.y - ghost.y);
                    const { dir } = turns[0];
                    ghost.dir = dir;
                    const newVec = DirVector[ghost.dir];
                    ghost.x += overshoot * newVec.x;
                    ghost.y += overshoot * newVec.y;
                }
                else {
                    ghost.x = newPos.x;
                    ghost.y = newPos.y;
                }
            }
            else {
                ghost.x = newPos.x;
                ghost.y = newPos.y;
            }
        }

        for (const ghost of ghosts) {
            const ghostTileX = Math.floor(ghost.x);
            const ghostTileY = Math.floor(ghost.y);
            let ghostSpawnX;
            let ghostSpawnY;
            if (ghost.name === "Blinky") {
                ghostSpawnX = Math.floor(pinky.SpawnX);
                ghostSpawnY = Math.floor(pinky.SpawnY);
            }
            else {
                ghostSpawnX = Math.floor(ghost.SpawnX);
                ghostSpawnY = Math.floor(ghost.SpawnY);
            }

            if (ghost.state === GhostState.Eaten) {
                if (ghostTileX === ghostSpawnX && ghostTileY === ghostSpawnY) {
                    ghost.state = GhostState.Escaping;
                }
            }
            else {
                if (ghostTileX === PacmanTileX && ghostTileY === PacmanTileY) {
                    if (ghost.timer > 0) {
                        ghost.state = GhostState.Eaten;
                        ghost.timer = 0;
                        playSound(sounds.eatGhost);
                    }
                    else {
                        pacman.dying = true;
                        pacman.animation = 0;
                        pacman.animationDir = 1;
                        gameover = true;
                        countdown = 1;
                        return;
                    }
                }
            }
        }
    }

    // animation
    pacman.animation += AnimationSpeed * dt * pacman.animationDir;
    if (!pacman.dying) {
        if (pacman.animation >= 2) {
            pacman.animation = 2;
            pacman.animationDir = -1;
        }
        else if (pacman.animation <= 0) {
            pacman.animation = 0;
            pacman.animationDir = 1;
        }
    }
    else if (pacman.animation >= 11) {
        pacman.dying = false;
        countdown = 2;
    }

    for (const ghost of ghosts) {
        ghost.animation = (ghost.animation + AnimationSpeed * dt) % 2;
    }
}

function draw() {
    // Clear screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw maze
    for (let y = 0; y < TileHeight; y++) {
        for (let x = 0; x < TileWidth; x++) {
            let currentTile = Maze[TileWidth * y + x];
            if (currentTile === 47 && (time - Math.floor(time)) % 0.5 > 0.25)
                currentTile -= 3;
            const mazeX = currentTile % 16;
            const mazeY = Math.floor(currentTile / 16);

            ctx.drawImage(images.maze, mazeX * (TileSize + 1), mazeY * (TileSize + 1), TileSize, TileSize,
                            x * TileSize, y * TileSize, TileSize, TileSize);
        }
    }

    ctx.fillStyle = "#ffb7ff";
    ctx.fillRect((TileWidth / 2 - 0.95) * TileSize, 15.65 * TileSize, 1.9 * TileSize, 0.25 * TileSize);

    // draw UI
    drawText("HIGH SCORE", 9, 0);
    drawNumber(0, 6, 1);
    drawNumber(score, 5, 1);

    let lifeX = 2;
    let lifeY = 34;
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(images.sprites, 8 * SpriteSize, 1 * SpriteSize, SpriteSize, SpriteSize,
                      lifeX * TileSize, lifeY * TileSize, SpriteSize, SpriteSize);
        lifeX += 2;
    }

    const drawOffset = SpriteSize / 2;

    // draw ghosts
    if (showGhosts) {
        for (const [idx, ghost] of ghosts.entries()) {
            if (ghost.timer > 0) {
                ctx.drawImage(images.sprites, (8 + Math.floor(ghost.animation)) * SpriteSize, 4 * SpriteSize, SpriteSize,
                            SpriteSize, TileSize * ghost.x - drawOffset, TileSize * ghost.y - drawOffset, SpriteSize, SpriteSize);
            }
            else if (ghost.state === GhostState.Eaten) {
                ctx.drawImage(images.sprites, (8 + ghost.dir) * SpriteSize, 5 * SpriteSize, SpriteSize,
                            SpriteSize, TileSize * ghost.x - drawOffset, TileSize * ghost.y - drawOffset, SpriteSize, SpriteSize);
            }
            else {
                ctx.drawImage(images.sprites, (ghost.dir * 2 + Math.floor(ghost.animation)) * SpriteSize, (4 + idx) * SpriteSize,
                            SpriteSize, SpriteSize, TileSize * ghost.x - drawOffset, TileSize * ghost.y - drawOffset, SpriteSize, SpriteSize);
            }
        }
    }

    // draw pacman
    if (!pacman.dying && (!gameover || gamewon)) {
        const animationFrame = pacman.animationDir == 1 ? Math.floor(pacman.animation) : Math.ceil(pacman.animation);

        if (animationFrame === 0) {
            ctx.drawImage(images.sprites, SpriteSize * 2, 0, SpriteSize - 1, SpriteSize - 1, (pacman.x * TileSize) - drawOffset,
                            (pacman.y * TileSize) - drawOffset, SpriteSize - 1, SpriteSize - 1);
        }
        else {
            ctx.drawImage(images.sprites, animationFrame === 1 ? SpriteSize : 0, pacman.dir * SpriteSize,
                            SpriteSize - 1, SpriteSize - 1, (pacman.x * TileSize) - drawOffset,
                            (pacman.y * TileSize) - drawOffset, SpriteSize - 1, SpriteSize - 1);
        }
    }
    else {
        if (pacman.animation < 11) {
            ctx.drawImage(images.sprites, SpriteSize * (3 + Math.floor(pacman.animation)), 0, SpriteSize - 1, SpriteSize - 1,
                            (pacman.x * TileSize) - drawOffset, (pacman.y * TileSize) - drawOffset, SpriteSize - 1, SpriteSize - 1);
        }
    }

    if (ready) {
        drawText("READY!", 11, 20, Color.Yellow);
    }
}

document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowRight":
            pacman.desiredDir = Direction.Right;
            break;
        case "ArrowDown":
            pacman.desiredDir = Direction.Down;
            break;
        case "ArrowLeft":
            pacman.desiredDir = Direction.Left;
            break;
        case "ArrowUp":
            pacman.desiredDir = Direction.Up;
            break;
        case " ":
            start = true;
            break;
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "p") {
        console.log(`pacman x: ${Math.floor(pacman.x)} y: ${Math.floor(pacman.y)}`)
    }
});

// Start game
(async function () {
    await loadAllAssets();
    images.maze = makeBlackTransparent(images.maze);
    images.sprites = makeBlackTransparent(images.sprites);
    images.text = makeBlackTransparent(images.text);
    restartGame();
    requestAnimationFrame(gameLoop);
})()
