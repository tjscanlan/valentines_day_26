# Valentine's Sliding Puzzle

A static web app featuring an interactive sliding puzzle that forms a pink heart with the message "Will you be my eme valentine?" in red bubble letters. The background is cream-colored.

## How to Play

The goal is to arrange the scrambled tiles to form a complete pink heart with the message "Will you be my eme valentine?" When solved, a congratulatory message appears.

## How to Play

The goal is to arrange the scrambled tiles to form a complete pink heart with the message "Will you be my eme valentine?" When solved, a congratulatory message appears.

### Desktop/Web Browser
- Click and hold on any tile (a red border will appear around the selected tile).
- Drag the tile toward the empty spot - it will follow your mouse cursor.
- Release the mouse button:
  - If dropped near the empty area, the tile slides smoothly into place.
  - If dropped elsewhere, it snaps back to its original position.
- Repeat until all tiles are correctly arranged.

**Hint Button:** Click the "Get Hint" button at the bottom to automatically move the correct tile into the empty spot. The button will show "Moving..." and be disabled during the animation, and the moving tile will be highlighted with a red border and shadow.

### Mobile Browser
- Tap and hold on any tile (a red border will appear around the selected tile).
- Drag your finger to move the tile toward the empty spot - it will follow your touch.
- Lift your finger:
  - If released near the empty area, the tile slides into place.
  - If not, it returns to its original position.
- Complete the puzzle as above.

**Hint Button:** Tap the "Get Hint" button at the bottom to automatically move the correct tile into the empty spot. The button will show "Moving..." and be disabled during the animation, and the moving tile will be highlighted with a red border and shadow.

**Note**: Any tile can be selected and moved. The grid lines help guide your movements, and the red border indicates the currently selected/dragged tile.

## Hosting on GitHub Pages

1. Create a new repository on GitHub.
2. Upload all files from this project (including the `.github` folder) to the repository.
3. Go to Settings > Pages, select "GitHub Actions" as the source.
4. Push to the `main` branch (or merge a PR to main) to trigger automatic deployment.
5. Your site will be available at `https://<username>.github.io/<repo-name>/`.

## Local Development

To run locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.