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

function isCollision(offset = { x: 0, y: 0 }) {
    return currentTetromino.shape.some((row, y) =>
        row.some((cell, x) => {
            if (cell) {
                const newX = currentPosition.x + x + offset.x;
                const newY = currentPosition.y + y + offset.y;
                return (
                    newX < 0 || // 左枠外
                    newX >= COLS || // 右枠外
                    newY >= ROWS || // 下枠外
                    (newY >= 0 && board[newY][newX]) // 他のブロックと衝突
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
    canHold = true; // ホールド可能にする
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
    const key = event.key.toLowerCase(); // 小文字に変換して比較
    switch (key) {
        case 'arrowleft': // 左矢印キーで左に移動
            moveTetromino(-1);
            break;
        case 'arrowright': // 右矢印キーで右に移動
            moveTetromino(1);
            break;
        case 'arrowdown': // 下矢印キーでソフトドロップ
            softDrop();
            break;
        case 'arrowup': // 上矢印キーでハードドロップ
            hardDrop();
            break;
        case 'z': // zキーで左回転
            rotateTetromino(-1);
            break;
        case 'x': // xキーで右回転
            rotateTetromino(1);
            break;
        case 'c': // cキーでホールド
            holdCurrentTetromino();
            break;
    }
}

function rotateTetromino(direction) {
    const originalShape = currentTetromino.shape.map(row => [...row]); // 元の形状を保存
    const size = originalShape.length;

    // 回転処理
    const newShape = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (direction === 1) {
                newShape[x][size - 1 - y] = originalShape[y][x]; // 右回転
            } else {
                newShape[size - 1 - x][y] = originalShape[y][x]; // 左回転
            }
        }
    }

    currentTetromino.shape = newShape;

    // 枠外に出た場合の補正
    if (isCollision()) {
        for (let offset = 1; offset < size; offset++) {
            if (!isCollision({ x: -offset, y: 0 })) {
                currentPosition.x -= offset; // 左に補正
                return;
            } else if (!isCollision({ x: offset, y: 0 })) {
                currentPosition.x += offset; // 右に補正
                return;
            }
        }
        currentTetromino.shape = originalShape; // 衝突したら元に戻す
    }
}

function holdCurrentTetromino() {
    if (!canHold) return;
    if (holdTetromino) {
        const temp = holdTetromino;
        holdTetromino = currentTetromino;
        currentTetromino = temp;
        currentPosition = { x: 3, y: 0 }; // 初期位置に戻す
    } else {
        holdTetromino = currentTetromino;
        spawnTetromino();
    }
    canHold = false;
    drawHoldTetromino();
}

function isTSpin() {
    // Tスピン判定ロジック
    // ...Tスピン判定のコードを実装...
    return false; // 仮の値
}

function checkGameOver() {
    // 一番上のラインにブロックがある場合、ゲームオーバー
    if (board[0].some(cell => cell)) {
        triggerGameOver();
    }
}

function triggerGameOver() {
    cancelAnimationFrame(gameLoopId); // ゲームループを停止
    document.getElementById('game-over').classList.remove('hidden');
}

function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    holdTetromino = null;
    canHold = true;
    nextTetrominos = [];
    spawnTetromino();
    document.getElementById('game-over').classList.add('hidden');
    lastDropTime = Date.now();
    gameLoop(); // ゲームループを再開
}

// イベントリスナーを追加
document.getElementById('menu-button').addEventListener('click', () => {
    window.location.href = 'menu.html';
});

document.getElementById('retry-button').addEventListener('click', resetGame);

let gameLoopId;

let dropInterval = 1000; // 自然落下の間隔（ミリ秒）
let lastDropTime = Date.now();

function gameLoop() {
    const now = Date.now();
    if (now - lastDropTime >= dropInterval) {
        softDrop(); // 自然落下
        lastDropTime = now;
    }

    drawBoard();
    drawNextTetrominos();
    updateUI();
    checkGameOver(); // ゲームオーバー判定
    gameLoopId = requestAnimationFrame(gameLoop);
}

spawnTetromino();
gameLoop();
