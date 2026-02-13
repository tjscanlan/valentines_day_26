# Valentine's Sliding Puzzle

A static web app featuring an interactive sliding puzzle that forms a pink heart with the message "Will you be my eme valentine?" in red bubble letters. The background is cream-colored.

## How to Play

- Click on a tile adjacent to the empty space to slide it.
- Arrange the tiles to form the complete heart image.
- When solved, a congratulatory message will appear.

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