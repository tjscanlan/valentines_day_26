# Valentine's Sliding Puzzle

A static web app featuring an interactive sliding puzzle that forms a pink heart with the message "Will you be my eme valentine?" in red bubble letters. The background is cream-colored.

## How to Play

The goal is to arrange the scrambled tiles to form a complete pink heart with the message "Will you be my eme valentine?" When solved, a congratulatory message appears.

### Desktop/Web Browser
- Click and hold on a tile adjacent to the empty space.
- Drag the tile toward the empty spot.
- Release the mouse button:
  - If dropped near the empty area, the tile slides smoothly into place.
  - If dropped elsewhere, it snaps back to its original position.
- Repeat until all tiles are correctly arranged.

### Mobile Browser
- Tap and hold on a tile adjacent to the empty space.
- Drag your finger to move the tile toward the empty spot.
- Lift your finger:
  - If released near the empty area, the tile slides into place.
  - If not, it returns to its original position.
- Complete the puzzle as above.

**Note**: Only tiles adjacent to the empty space can be moved. The grid lines help guide your movements.

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