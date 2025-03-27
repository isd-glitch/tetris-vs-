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

let currentTetromino = null;
let currentPosition = { x: 3, y: 0 }; // 初期位置
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

function drawNextTetrominos() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    for (let i = 0; i < Math.min(3, nextTetrominos.length); i++) {
        const tetromino = nextTetrominos[i];
        drawTetrominoPreview(tetromino, i);
    }
}

function drawTetrominoPreview(tetromino, index) {
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
}

function spawnTetromino() {
    generateTetrominos();
    currentTetromino = nextTetrominos.shift();
    currentPosition = { x: 3, y: 0 }; // 初期位置
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

function moveTetromino(direction) {
    currentPosition.x += direction;
    if (isCollision()) {
        currentPosition.x -= direction; // 衝突したら元に戻す
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
    currentPosition.y--; // 衝突する直前に戻す
    placeTetromino();
}

function isCollision() {
    return currentTetromino.shape.some((row, y) =>
        row.some((cell, x) => {
            if (cell) {
                const newX = currentPosition.x + x;
                const newY = currentPosition.y + y;
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
    spawnTetromino();
}

function clearLines() {
    board = board.filter(row => row.some(cell => !cell));
    while (board.length < ROWS) {
        board.unshift(Array(COLS).fill(0));
    }
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

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowLeft': // 左矢印キーで左に移動
            moveTetromino(-1);
            break;
        case 'ArrowRight': // 右矢印キーで右に移動
            moveTetromino(1);
            break;
        case 'ArrowDown': // 下矢印キーでソフトドロップ
            softDrop();
            break;
        case 'ArrowUp': // 上矢印キーでハードドロップ
            hardDrop();
            break;
        case 'z': // zキーで左回転
            rotateTetromino(-1);
            break;
        case 'x': // xキーで右回転
            rotateTetromino(1);
            break;
    }
}

function rotateTetromino(direction) {
    // テトリミノを回転
    // directionが-1なら左回転、1なら右回転
    // Tスピン判定を追加
    const originalState = JSON.stringify(currentTetromino);
    currentTetromino.rotate(direction);

    if (isCollision()) {
        currentTetromino = JSON.parse(originalState); // 回転を元に戻す
        if (isTSpin()) {
            console.log('Tスピン成功!');
            // Tスピンのスコア加算ロジックを追加
        }
    }
}

function isTSpin() {
    // Tスピン判定ロジック
    // ...Tスピン判定のコードを実装...
    return false; // 仮の値
}

function gameLoop() {
    drawBoard();
    drawNextTetrominos();
    updateUI();
    requestAnimationFrame(gameLoop);
}

spawnTetromino();
gameLoop();
