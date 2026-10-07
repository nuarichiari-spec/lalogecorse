#!/usr/bin/env python3
"""Génère une page par partenaire (partenaires/<slug>.html), sitemap.xml et robots.txt à partir de data/partenaires.json.
Lancer après toute modification des partenaires :  python3 scripts/build-partenaires.py
"""
import json, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://lalogecorse.fr"
P = json.loads((ROOT / "data/partenaires.json").read_text(encoding="utf8"))
e = html.escape

HEAD = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{nom} · Partenaire de La Loge Corse</title>
<meta name="description" content="{nom} : {desc} Partenaire de La Loge Corse au Stade Jean-Bouin.">
<link rel="canonical" href="{site}/partenaires/{slug}.html">
<meta name="theme-color" content="#071F4B">
<link rel="icon" href="../favicon.png">
<meta property="og:title" content="{nom} · Partenaire de La Loge Corse">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/assets/img/logos/{logo}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="../assets/css/style.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="wrap site-header">
  <a class="brand" href="../index.html"><img src="../assets/img/la-loge-corse.webp" alt="Logo La Loge Corse"><span><span class="name">LÀ LOGE CORSE</span></span></a>
  <nav class="nav"><a class="btn btn-pink" href="../index.html#calendrier">Inscrire mes invités</a></nav>
</header>
<main class="wrap pmain">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="../index.html#table">La table des 13</a> › <span>{nom}</span></nav>
  <section class="phero">
    <div class="col">
      <span class="eyebrow">{role} · Siège {num} sur {total}</span>
      <h1>{nom}</h1>
      <p class="big">{desc}</p>
{who}
      <div class="row">{visit}</div>
    </div>
    <div class="card"><img src="../assets/img/logos/{logo}" alt="Logo {nom}"></div>
  </section>
  <section class="others">
    <h2>Les autres sièges de la table</h2>
    <div class="tiles">{tiles}</div>
  </section>
</main>
<footer class="wrap"><div class="foot" style="padding-bottom:40px"><span>© La Loge Corse · Stade Jean-Bouin · 20-40 avenue du Général Sarrail, 75016 Paris</span><a href="mailto:jeromebrigato@lalogecorse.fr">jeromebrigato@lalogecorse.fr</a></div></footer>
</body>
</html>
"""

out = ROOT / "partenaires"
out.mkdir(exist_ok=True)
for i, p in enumerate(P):
    ld = json.dumps({"@context": "https://schema.org", "@type": "Organization", "name": p["nom"], "description": p["desc"],
                     "logo": f"{SITE}/assets/img/logos/{p['logo']}", **({"url": p["url"]} if p["url"] else {})}, ensure_ascii=False)
    who = f'<p class="who"><strong>{e(p["personne"])}</strong> · {e(p["fonction"])}</p>' if p["personne"] else ""
    visit = (f'<a class="btn btn-pink" href="{e(p["url"])}" target="_blank" rel="noopener">Découvrir {e(p["nom"])} →</a>'
             if p["url"] else '<span class="pill">Site bientôt disponible</span>')
    cur = ' aria-current="page"'
    tiles = "".join(
        '<a href="%s.html" aria-label="%s"%s><img src="../assets/img/logos/%s" alt=""></a>'
        % (q["slug"], e(q["nom"]), cur if q is p else "", q["logo"]) for q in P)
    page = HEAD.format(nom=e(p["nom"]), desc=e(p["desc"]), slug=p["slug"], logo=p["logo"], site=SITE, role=e(p["role"]),
                       num=i + 1, total=len(P), who=who, visit=visit, tiles=tiles, ld=ld.replace("</", "<\\/"))
    (out / f'{p["slug"]}.html').write_text(page, encoding="utf8")

urls = [f"{SITE}/"] + [f"{SITE}/partenaires/{p['slug']}.html" for p in P]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n", encoding="utf8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n", encoding="utf8")
print(f"{len(P)} pages partenaires, sitemap.xml et robots.txt générés")
