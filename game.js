const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let lines = 0;
let level = 1;

const nextCanvas = document.getElementById('next-board');
const nextCtx = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('hold-board');
const holdCtx = holdCanvas.getContext('2d');

let holdTetromino = null;
let canHold = true;

let currentTetromino = null;
let currentPosition = { x: 3, y: 0 };
let nextTetrominos = [];
const tetrominoTypes = [
    { type: 'I', color: 'cyan', shape: [[1, 1, 1, 1]] },
    { type: 'O', color: 'yellow', shape: [[1, 1], [1, 1]] },
    { type: 'T', color: 'purple', shape: [[0, 1, 0], [1, 1, 1]] },
    { type: 'S', color: 'green', shape: [[0, 1, 1], [1, 1, 0]] },
    { type: 'Z', color: 'red', shape: [[1, 1, 0], [0, 1, 1]] },
    { type: 'J', color: 'blue', shape: [[1, 0, 0], [1, 1, 1]] },
    { type: 'L', color: 'orange', shape: [[0, 0, 1], [1, 1, 1]] },
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateTetrominos() {
    if (nextTetrominos.length < 7) {
        const newBag = shuffle([...tetrominoTypes]);
        nextTetrominos.push(...newBag);
    }
}

function spawnTetromino() {
    generateTetrominos();
    currentTetromino = nextTetrominos.shift();
    currentPosition = { x: 3, y: 0 };
    generateTetrominos();
    drawNextTetrominos();
}

function drawTetromino() {
    ctx.fillStyle = currentTetromino.color;
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const drawX = (currentPosition.x + x) * BLOCK_SIZE;
                const drawY = (currentPosition.y + y) * BLOCK_SIZE;
                ctx.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawNextTetrominos() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextTetrominos.slice(0, 3).forEach((tetromino, index) => {
        const xOffset = 10;
        const yOffset = index * 100 + 10;
        nextCtx.fillStyle = tetromino.color;
        tetromino.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    nextCtx.fillRect(xOffset + x * BLOCK_SIZE / 2, yOffset + y * BLOCK_SIZE / 2, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
                    nextCtx.strokeStyle = '#000';
                    nextCtx.strokeRect(xOffset + x * BLOCK_SIZE / 2, yOffset + y * BLOCK_SIZE / 2, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
                }
            });
        });
    });
}

function drawHoldTetromino() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdTetromino) {
        holdCtx.fillStyle = holdTetromino.color;
        holdTetromino.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    holdCtx.fillRect(x * BLOCK_SIZE / 2, y * BLOCK_SIZE / 2, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
                    holdCtx.strokeStyle = '#000';
                    holdCtx.strokeRect(x * BLOCK_SIZE / 2, y * BLOCK_SIZE / 2, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
                }
            });
        });
    }
}

function rotateTetromino(direction) {
    const originalShape = currentTetromino.shape.map(row => [...row]);
    const size = originalShape.length;

    const newShape = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (direction === 1) {
                newShape[x][size - 1 - y] = originalShape[y][x];
            } else {
                newShape[size - 1 - x][y] = originalShape[y][x];
            }
        }
    }

    currentTetromino.shape = newShape;

    if (isCollision()) {
        currentTetromino.shape = originalShape;
    }
}

function isCollision(offset = { x: 0, y: 0 }) {
    return currentTetromino.shape.some((row, y) =>
        row.some((cell, x) => {
            if (cell) {
                const newX = currentPosition.x + x + offset.x;
                const newY = currentPosition.y + y + offset.y;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        })
    );
}

function placeTetromino() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                const boardX = currentPosition.x + x;
                const boardY = currentPosition.y + y;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentTetromino.color;
                }
            }
        });
    });
    clearLines();
    canHold = true;
    spawnTetromino();
}

function clearLines() {
    board = board.filter(row => row.some(cell => !cell));
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
    }
}

function softDrop() {
    currentPosition.y++;
    if (isCollision()) {
        currentPosition.y--;
        placeTetromino();
    }
}

function hardDrop() {
    while (!isCollision()) {
        currentPosition.y++;
    }
    currentPosition.y--;
    placeTetromino();
}

function holdCurrentTetromino() {
    if (!canHold) return;
    if (holdTetromino) {
        const temp = holdTetromino;
        holdTetromino = currentTetromino;
        currentTetromino = temp;
        currentPosition = { x: 3, y: 0 };
    } else {
        holdTetromino = currentTetromino;
        spawnTetromino();
    }
    canHold = false;
    drawHoldTetromino();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = cell;
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
    drawTetromino();
}

function updateUI() {
    document.getElementById('score').textContent = `スコア: ${score}`;
    document.getElementById('lines').textContent = `ライン: ${lines}`;
    document.getElementById('level').textContent = `レベル: ${level}`;
}

document.addEventListener('keydown', event => {
    switch (event.key.toLowerCase()) {
        case 'arrowleft':
            moveTetromino(-1);
            break;
        case 'arrowright':
            moveTetromino(1);
            break;
        case 'arrowdown':
            softDrop();
            break;
        case 'arrowup':
            hardDrop();
            break;
        case 'z':
            rotateTetromino(-1);
            break;
        case 'x':
            rotateTetromino(1);
            break;
        case 'c':
            holdCurrentTetromino();
            break;
    }
});

function gameLoop() {
    drawBoard();
    updateUI();
    requestAnimationFrame(gameLoop);
}

spawnTetromino();
gameLoop();
