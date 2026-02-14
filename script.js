const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const hintButton = document.getElementById('hint-button');
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
let dragging = false;
let draggedTile = null;
let draggedIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;
let movingToEmpty = false;
let hinting = false;

function getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
    } else {
        return {x: e.clientX, y: e.clientY};
    }
}

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

// Draw the pink heart (single unified shape in center 4 tiles: 100-300 x,y)
hiddenCtx.fillStyle = 'pink';
hiddenCtx.beginPath();
// Start at bottom point
hiddenCtx.moveTo(200, 280);
// Left side going up
hiddenCtx.bezierCurveTo(160, 260, 100, 220, 100, 160);
// Left lobe
hiddenCtx.bezierCurveTo(100, 130, 120, 110, 145, 110);
hiddenCtx.bezierCurveTo(170, 110, 185, 130, 200, 145);
// Right lobe
hiddenCtx.bezierCurveTo(215, 130, 230, 110, 255, 110);
hiddenCtx.bezierCurveTo(280, 110, 300, 130, 300, 160);
// Right side going down
hiddenCtx.bezierCurveTo(300, 220, 240, 260, 200, 280);
hiddenCtx.fill();

// Draw the text in red bubble letters (centered inside the heart)
hiddenCtx.fillStyle = '#8B0000'; // Darker red for better visibility
hiddenCtx.font = 'bold 13px Arial';
hiddenCtx.textAlign = 'center';
hiddenCtx.fillText('Will you be', 200, 200);
hiddenCtx.fillText('my eme', 200, 217);
hiddenCtx.fillText('valentine?', 200, 234);

// Add white stroke for bubble effect
hiddenCtx.strokeStyle = 'white';
hiddenCtx.lineWidth = 1.5;
hiddenCtx.strokeText('Will you be', 200, 200);
hiddenCtx.strokeText('my eme', 200, 217);
hiddenCtx.strokeText('valentine?', 200, 234);

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
        ctx.save();
        if (dragging || hinting) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
        }
        ctx.drawImage(hiddenCanvas, tileCol * tileSize, tileRow * tileSize, tileSize, tileSize, animatingX, animatingY, tileSize, tileSize);
        if (dragging || hinting) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.strokeRect(animatingX, animatingY, tileSize, tileSize);
        }
        ctx.restore();
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
        if (movingToEmpty) {
            tiles[emptyIndex] = animatingTile;
            tiles[animatingIndex] = null;
            emptyIndex = animatingIndex;
            if (isSolved()) {
                alert('Congratulations! You solved the puzzle!');
            }
        }
        animating = false;
        animatingTile = null;
        animatingIndex = -1;
        movingToEmpty = false;
        hinting = false;
        hintButton.disabled = false;
        hintButton.textContent = "Get Hint";
        drawPuzzle();
        return;
    }
    const factor = 0.2; // Smoother animation
    animatingX += dx * factor;
    animatingY += dy * factor;
    drawPuzzle();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    if (animating) return;
    const rect = canvas.getBoundingClientRect();
    const pos = getEventPos(e);
    const x = Math.floor((pos.x - rect.left) / tileSize);
    const y = Math.floor((pos.y - rect.top) / tileSize);
    const index = getIndex(x, y);
    if (tiles[index] !== null) {  // any tile except empty
        dragging = true;
        draggedIndex = index;
        draggedTile = tiles[index];
        dragOffsetX = (pos.x - rect.left) % tileSize;
        dragOffsetY = (pos.y - rect.top) % tileSize;
        animatingIndex = index;
        animatingTile = draggedTile;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const pos = getEventPos(e);
        animatingX = pos.x - rect.left - dragOffsetX;
        animatingY = pos.y - rect.top - dragOffsetY;
        drawPuzzle();
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (dragging) {
        dragging = false;
        const rect = canvas.getBoundingClientRect();
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;
        const emptyCenterX = emptyCol * tileSize + tileSize / 2;
        const emptyCenterY = emptyRow * tileSize + tileSize / 2;
        const tileCenterX = animatingX + tileSize / 2;
        const tileCenterY = animatingY + tileSize / 2;
        const dist = Math.sqrt((tileCenterX - emptyCenterX) ** 2 + (tileCenterY - emptyCenterY) ** 2);
        if (dist < tileSize / 2) {
            // move to empty
            targetX = emptyCol * tileSize;
            targetY = emptyRow * tileSize;
            movingToEmpty = true;
        } else {
            // back to original
            const row = Math.floor(draggedIndex / gridSize);
            const col = draggedIndex % gridSize;
            targetX = col * tileSize;
            targetY = row * tileSize;
            movingToEmpty = false;
        }
        animating = true;
        animate();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (animating) return;
    const rect = canvas.getBoundingClientRect();
    const pos = getEventPos(e);
    const x = Math.floor((pos.x - rect.left) / tileSize);
    const y = Math.floor((pos.y - rect.top) / tileSize);
    const index = getIndex(x, y);
    if (tiles[index] !== null) {  // any tile except empty
        dragging = true;
        draggedIndex = index;
        draggedTile = tiles[index];
        dragOffsetX = (pos.x - rect.left) % tileSize;
        dragOffsetY = (pos.y - rect.top) % tileSize;
        animatingIndex = index;
        animatingTile = draggedTile;
    }
}, {passive: false});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (dragging) {
        const rect = canvas.getBoundingClientRect();
        const pos = getEventPos(e);
        animatingX = pos.x - rect.left - dragOffsetX;
        animatingY = pos.y - rect.top - dragOffsetY;
        drawPuzzle();
    }
}, {passive: false});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (dragging) {
        dragging = false;
        const rect = canvas.getBoundingClientRect();
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;
        const emptyCenterX = emptyCol * tileSize + tileSize / 2;
        const emptyCenterY = emptyRow * tileSize + tileSize / 2;
        const tileCenterX = animatingX + tileSize / 2;
        const tileCenterY = animatingY + tileSize / 2;
        const dist = Math.sqrt((tileCenterX - emptyCenterX) ** 2 + (tileCenterY - emptyCenterY) ** 2);
        if (dist < tileSize / 2) {
            // move to empty
            targetX = emptyCol * tileSize;
            targetY = emptyRow * tileSize;
            movingToEmpty = true;
        } else {
            // back to original
            const row = Math.floor(draggedIndex / gridSize);
            const col = draggedIndex % gridSize;
            targetX = col * tileSize;
            targetY = row * tileSize;
            movingToEmpty = false;
        }
        animating = true;
        animate();
    }
}, {passive: false});

function isSolved() {
    for (let i = 0; i < totalTiles - 1; i++) {
        if (tiles[i] !== i) return false;
    }
    return tiles[totalTiles - 1] === null;
}

function hint() {
    if (animating) return;
    // Find the tile that belongs in the empty position
    const correctTile = emptyIndex;
    const tileIndex = tiles.indexOf(correctTile);
    if (tileIndex !== -1 && tileIndex !== emptyIndex) {
        // Move this tile to the empty position
        hintButton.disabled = true;
        hintButton.textContent = "Moving...";
        hinting = true;
        animatingIndex = tileIndex;
        animatingTile = tiles[tileIndex];
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;
        animatingX = emptyCol * tileSize;
        animatingY = emptyRow * tileSize;
        targetX = emptyCol * tileSize;
        targetY = emptyRow * tileSize;
        movingToEmpty = true;
        animating = true;
        animate();
    }
}

drawPuzzle();

document.getElementById('hint-button').addEventListener('click', hint);