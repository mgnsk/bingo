# bingo

Make printable bingo cards: enter a title and at least 25 words or phrases,
choose how many cards you need, and download them as a PDF (A4, one 5×5 card
each, shuffled per card).

**https://bingo.kokk.eu**

Everything runs in the browser. Your list is kept in the page URL, so you can
bookmark or share it, and in local storage.

## Development

```sh
npm ci
npm run dev
```

Every push to `main` builds the site and deploys it to GitHub Pages.
