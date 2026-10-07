# La Loge Corse — nouvelle version du site (« La Table des 13 »)

Site statique (HTML, CSS, JavaScript), sans outil de compilation.

- `index.html` : page d'accueil.
- `partenaires/*.html` : une page par partenaire (générées par `python3 scripts/build-partenaires.py`).
- `data/partenaires.json`, `data/matchs.json` : contenu modifiable sans toucher au code.
- `data/videos.json` : mis à jour chaque matin par `.github/workflows/update-videos.yml` (flux YouTube officiels du Paris FC et du Stade Français Paris).
- `assets/` : images, logos et vidéo de bienvenue.

Mise en ligne : copier tout le contenu du dépôt à la racine de l'hébergement (ex. www.lalogecorse.fr).
Après modification de `data/partenaires.json`, relancer `python3 scripts/build-partenaires.py`.
