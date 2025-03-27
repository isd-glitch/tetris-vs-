const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let lines = 0;
let level = 1;

// ...existing code for tetromino definitions...

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = 'cyan';
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// ...existing code for game loop, tetromino movement, collision detection...

function updateUI() {
    document.getElementById('score').textContent = `スコア: ${score}`;
    document.getElementById('lines').textContent = `ライン: ${lines}`;
    document.getElementById('level').textContent = `レベル: ${level}`;
}

// ...existing code for T-spin detection, line clearing, and scoring...

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

function moveTetromino(direction) {
    // テトリミノを左右に移動
    // ...existing code for moving tetromino...
}

function softDrop() {
    // テトリミノを1マス下に移動
    // ...existing code for soft drop...
}

function hardDrop() {
    // テトリミノを一気に下まで移動
    while (!isCollision()) {
        currentTetromino.y++;
    }
    currentTetromino.y--; // 衝突する直前に戻す
    placeTetromino();
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

function placeTetromino() {
    // テトリミノを固定し、ライン消去をチェック
    // ...ライン消去とスコア加算のコード...
}

function gameLoop() {
    drawBoard();
    updateUI();
    requestAnimationFrame(gameLoop);
}

gameLoop();
