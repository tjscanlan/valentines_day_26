import { createApp, onMounted, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const App = {
  setup() {
    const gridSize = 4;
    const totalTiles = gridSize * gridSize;
    const tiles = ref([]);
    const emptyIndex = ref(totalTiles - 1);
    const containerSize = ref(Math.min(400, Math.floor(window.innerWidth * 0.92)));
    const tileSize = ref(Math.floor(containerSize.value / gridSize));
    const moving = ref(false);

    // Build an inline SVG image that will be used as the crisp source for all tiles
    function buildSvg(size = 400) {
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <rect width='100%' height='100%' fill='%23f5f5dc' />
        <g>
          <path d='M200 280 C160 260 100 220 100 160 C100 130 120 110 145 110 C170 110 185 130 200 145 C215 130 230 110 255 110 C280 110 300 130 300 160 C300 220 240 260 200 280 Z' fill='%23ffb6c1' />
          <text x='200' y='200' font-family='-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif' font-weight='700' font-size='28' fill='%238B0000' text-anchor='middle'>Will you be</text>
          <text x='200' y='235' font-family='-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif' font-weight='700' font-size='28' fill='%238B0000' text-anchor='middle'>my valentine?</text>
        </g>
      </svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    let svgUrl = buildSvg(containerSize.value);

    function makeTiles() {
      const arr = Array.from({ length: totalTiles - 1 }, (_, i) => i);
      arr.push(null);
      return arr;
    }

    function shuffleArray(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }

    function reset() {
      const arr = makeTiles();
      // Shuffle until we get a solvable permutation for the sliding puzzle
      let attempts = 0;
      do {
        shuffleArray(arr);
        attempts++;
      } while (!isSolvable(arr) && attempts < 10000);
      tiles.value = arr.slice();
      emptyIndex.value = tiles.value.indexOf(null);
    }

    function countInversions(flat) {
      const nums = flat.filter(n => n !== null);
      let inv = 0;
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          if (nums[i] > nums[j]) inv++;
        }
      }
      return inv;
    }

    function isSolvable(arr) {
      // Classic 15-puzzle rules generalized for gridSize
      const inv = countInversions(arr);
      const emptyPos = arr.indexOf(null);
      const rowFromBottom = gridSize - Math.floor(emptyPos / gridSize);
      if (gridSize % 2 === 1) {
        // odd grid: inversions must be even
        return inv % 2 === 0;
      } else {
        // even grid: solvable when (inversions + rowFromBottom) is odd
        return (inv + rowFromBottom) % 2 === 1;
      }
    }

    function indexToXY(index) {
      return { x: index % gridSize, y: Math.floor(index / gridSize) };
    }

    function xyToIndex(x, y) {
      return y * gridSize + x;
    }

    function isAdjacent(i1, i2) {
      const a = indexToXY(i1);
      const b = indexToXY(i2);
      return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) === 1;
    }

    function moveTile(clickedIndex) {
      if (moving.value) return;
      if (tiles.value[clickedIndex] === null) return;
      if (!isAdjacent(clickedIndex, emptyIndex.value)) return;
      moving.value = true;
      // swap
      const t = tiles.value[clickedIndex];
      tiles.value.splice(clickedIndex, 1, null);
      tiles.value.splice(emptyIndex.value, 1, t);
      emptyIndex.value = clickedIndex;
      // animation length matches CSS transition
      setTimeout(() => { moving.value = false; checkSolved(); }, 220);
    }

    function checkSolved() {
      for (let i = 0; i < totalTiles - 1; i++) {
        if (tiles.value[i] !== i) return false;
      }
      // solved
      setTimeout(() => alert('Congratulations! You solved the puzzle!'), 50);
      return true;
    }

    function getTileStyle(tileIndex, tileValue) {
      // tileIndex: where the tile currently is; tileValue: which original piece
      const { x, y } = indexToXY(tileIndex);
      const style = {
        width: `${tileSize.value}px`,
        height: `${tileSize.value}px`,
        transform: `translate(${x * tileSize.value}px, ${y * tileSize.value}px)`,
        transition: 'transform 200ms ease',
        backgroundColor: 'transparent',
      };
      if (tileValue !== null) {
        const tileCol = tileValue % gridSize;
        const tileRow = Math.floor(tileValue / gridSize);
        // image will be rendered as an <img> inside the tile; keep tile transparent
      } else {
        style.backgroundColor = 'transparent';
      }
      return style;
    }

    function getImgStyle(tileValue) {
      const tileCol = tileValue % gridSize;
      const tileRow = Math.floor(tileValue / gridSize);
      return {
        position: 'absolute',
        left: `-${tileCol * tileSize.value}px`,
        top: `-${tileRow * tileSize.value}px`,
        width: `${containerSize.value}px`,
        height: `${containerSize.value}px`,
        userSelect: 'none',
        pointerEvents: 'none'
      };
    }

    function hint() {
      // simple hint: move a random adjacent tile into empty spot if exists
      const adj = [];
      const e = emptyIndex.value;
      const { x, y } = indexToXY(e);
      const neighbors = [ [x-1,y],[x+1,y],[x,y-1],[x,y+1] ];
      for (const [nx, ny] of neighbors) {
        if (nx >=0 && nx < gridSize && ny >=0 && ny < gridSize) adj.push(xyToIndex(nx, ny));
      }
      if (adj.length === 0) return;
      const choice = adj[Math.floor(Math.random() * adj.length)];
      moveTile(choice);
    }

    function onResize() {
      containerSize.value = Math.min(420, Math.floor(window.innerWidth * 0.92));
      tileSize.value = Math.floor(containerSize.value / gridSize);
      // rebuild svg at the new output size so scaling is crisp
      svgUrl = buildSvg(containerSize.value);
    }

    onMounted(() => {
      reset();
      window.addEventListener('resize', onResize);
    });

    return {
      gridSize,
      tiles,
      tileSize,
      containerSize,
      svgUrl,
      getTileStyle,
      getImgStyle,
      moveTile,
      hint,
      reset,
    };
  },
  template: `
    <div class="app-root">
      <h1 class="title">Slide the pieces to form the heart</h1>
      <div class="controls">
        <button class="btn" @click="reset">Shuffle</button>
        <button class="btn primary" @click="hint">Hint</button>
      </div>
      <div class="puzzle-wrap" :style="{ width: containerSize + 'px', height: containerSize + 'px' }">
        <div class="puzzle">
          <div v-for="(tile, idx) in tiles" :key="idx" class="tile" :style="getTileStyle(idx, tile)" @click="moveTile(idx)" role="button" :aria-label="tile===null ? 'empty' : 'tile ' + tile">
            <img v-if="tile !== null" :src="svgUrl" :style="getImgStyle(tile)" draggable="false" alt="" />
            <span class="visually-hidden">{{ tile === null ? 'empty' : 'tile ' + tile }}</span>
          </div>
        </div>
      </div>
    </div>
  `
};

createApp(App).mount('#app');
