# Obsidian Atelier — Luxury Custom Cabinetry

A single-page website for a luxury custom cabinet studio. It has a Blueprint → 3D Build → Reality hero slider, a smart-features grid, a before/after gallery and a contact form that emails inquiries.

It's plain HTML, Tailwind (CDN) and vanilla JavaScript, so there's no build step.

```
index.html              page markup and styles
app.js                  slider, renders, gallery and contact form logic
assets/                 optional Higgsfield images (see HIGGSFIELD_PROMPTS.md)
HIGGSFIELD_PROMPTS.md   prompts for generating the stage and gallery images
.nojekyll               tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub (for example `obsidian-atelier`).
2. Upload every file in this folder to the repo. Either drag them into **Add file → Upload files**, or run:
   ```bash
   git init && git add . && git commit -m "Initial site" && git branch -M main
   git remote add origin https://github.com/<your-username>/obsidian-atelier.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: `main`** and **Folder: `/ (root)`**, then click **Save**.
4. After a minute or two the site is live at `https://<your-username>.github.io/obsidian-atelier/`.

To use your own domain, add it under **Settings → Pages → Custom domain** and follow GitHub's DNS instructions.

## Contact form email setup

Inquiries go to **stockmarkettd@gmail.com**. The setting is `CONFIG` at the top of `app.js`.

- **Default (FormSubmit, no account needed):** the first inquiry submitted on the live site triggers a one-time activation email to stockmarkettd@gmail.com. Click the link in that email, and every later inquiry is delivered.
- **Using Web3Forms instead:** get a free access key at https://web3forms.com with stockmarkettd@gmail.com, then paste it in:
  ```js
  WEB3FORMS_ACCESS_KEY: 'your-key-here',
  ```

## Adding generated images

Save the Higgsfield renders into `assets/` with these names, then commit and push. The site uses them automatically in place of the built-in vector renders:

- `stage-1-blueprint.jpg`, `stage-2-cgi-build.jpg`, `stage-3-reality.jpg`
- `gallery-meridian.jpg`, `gallery-monolith.jpg`, `gallery-nocturne.jpg`, `gallery-matrix.jpg`

## Preview locally

```bash
python3 -m http.server 5173
```
Then open http://localhost:5173.
