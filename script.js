const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const tileSize = 100;
const gridSize = 4;
const totalTiles = gridSize * gridSize;
let tiles = Array.from({length: totalTiles - 1}, (_, i) => i);
tiles.push(null); // empty tile
let emptyIndex = totalTiles - 1;
let animating = false;
let animatingTile = null;
let animatingIndex = -1;
let animatingX = 0;
let animatingY = 0;
let targetX = 0;
let targetY = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffle(tiles);
emptyIndex = tiles.indexOf(null);

// Create hidden canvas for the full image
const hiddenCanvas = document.createElement('canvas');
hiddenCanvas.width = canvas.width;
hiddenCanvas.height = canvas.height;
const hiddenCtx = hiddenCanvas.getContext('2d');

// Draw the pink heart
hiddenCtx.fillStyle = 'pink';
hiddenCtx.beginPath();
hiddenCtx.moveTo(200, 150);
hiddenCtx.bezierCurveTo(200, 100, 150, 50, 100, 100);
hiddenCtx.bezierCurveTo(50, 50, 0, 100, 0, 150);
hiddenCtx.bezierCurveTo(0, 200, 50, 250, 100, 250);
hiddenCtx.bezierCurveTo(150, 250, 200, 200, 200, 150);
hiddenCtx.fill();

// Draw the text in red bubble letters
hiddenCtx.fillStyle = 'red';
hiddenCtx.font = 'bold 20px Arial';
hiddenCtx.textAlign = 'center';
hiddenCtx.fillText('Will you be my', 200, 180);
hiddenCtx.fillText('eme valentine?', 200, 200);

function drawPuzzle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < totalTiles; i++) {
        const tile = tiles[i];
        if (tile === null || i === animatingIndex) continue;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const tileRow = Math.floor(tile / gridSize);
        const tileCol = tile % gridSize;
        ctx.drawImage(hiddenCanvas, tileCol * tileSize, tileRow * tileSize, tileSize, tileSize, col * tileSize, row * tileSize, tileSize, tileSize);
    }
    if (animating) {
        const tileRow = Math.floor(animatingTile / gridSize);
        const tileCol = animatingTile % gridSize;
        ctx.drawImage(hiddenCanvas, tileCol * tileSize, tileRow * tileSize, tileSize, tileSize, animatingX, animatingY, tileSize, tileSize);
    }
    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 1; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }
}

function getIndex(x, y) {
    return y * gridSize + x;
}

function isAdjacent(i1, i2) {
    const row1 = Math.floor(i1 / gridSize);
    const col1 = i1 % gridSize;
    const row2 = Math.floor(i2 / gridSize);
    const col2 = i2 % gridSize;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function animate() {
    const dx = targetX - animatingX;
    const dy = targetY - animatingY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) {
        // done
        tiles[emptyIndex] = animatingTile;
        tiles[animatingIndex] = null;
        emptyIndex = animatingIndex;
        animating = false;
        animatingTile = null;
        animatingIndex = -1;
        drawPuzzle();
        if (isSolved()) {
            alert('Congratulations! You solved the puzzle!');
        }
        return;
    }
    const speed = 10;
    animatingX += (dx / dist) * speed;
    animatingY += (dy / dist) * speed;
    drawPuzzle();
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    const clickedIndex = getIndex(x, y);
    if (animating) return;
    if (isAdjacent(clickedIndex, emptyIndex)) {
        animating = true;
        animatingIndex = clickedIndex;
        animatingTile = tiles[clickedIndex];
        const row = Math.floor(clickedIndex / gridSize);
        const col = clickedIndex % gridSize;
        animatingX = col * tileSize;
        animatingY = row * tileSize;
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;
        targetX = emptyCol * tileSize;
        targetY = emptyRow * tileSize;
        animate();
    }
});

function isSolved() {
    for (let i = 0; i < totalTiles - 1; i++) {
        if (tiles[i] !== i) return false;
    }
    return tiles[totalTiles - 1] === null;
}

drawPuzzle();