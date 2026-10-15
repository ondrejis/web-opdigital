# OP Digital – web

Nový firemní web OP Digital. Statický, lehký, bez frameworku na klientu.

**Stack:** [Eleventy](https://www.11ty.dev/) (šablony Nunjucks) · [Tailwind CSS v4](https://tailwindcss.com/) · [Alpine.js](https://alpinejs.dev/) · [Motion](https://motion.dev/) (scroll/reveal animace) · esbuild (bundlování JS).

Výsledek v `dist/` je čistě HTML + 1× CSS (~45 kB) + 1× JS (~80 kB min, ~29 kB gzip) + 2 fonty. Žádné externí requesty (fonty jsou self-hosted).

## Spuštění

```bash
npm install
npm run dev      # vývoj: http://localhost:8080 s live reloadem
npm run build    # produkční build do dist/
```

Nasazení: nahrát obsah `dist/` na libovolný statický hosting (Netlify, Vercel, Cloudflare Pages, FTP…). Build příkaz `npm run build`, výstupní složka `dist`.

## Struktura

```
src/
  _data/            obsah webu v JSON (služby, případovky, klienti, tým, postup, kontakty)
  _includes/
    layouts/        base.njk (kostra stránky), service.njk (šablona služby)
    partials/       header, footer, kontakt, marquee klientů, karta případovky, tým, cookies, CTA pás
  styles/main.css   design tokeny (@theme) + komponenty (.btn, .card-flood, .input-xl, .marquee…)
  scripts/main.js   Alpine komponenty (rotující titulek, menu, formulář, cookies, čítače, akordeon) + Motion animace
  assets/           fonty, loga, SVG vizuály do pozadí (noise, grid, obrys loga), OG obrázek
  *.njk             jednotlivé stránky
```

## Stránky

| URL | Obsah |
| --- | --- |
| `/` | Homepage: hero s rotujícím titulkem, služby, projekty, reference, postup (sticky karty), tým, kontakt |
| `/systemy/`, `/weby/`, `/kampane/` | Detail služby (obsah z `services.json`) |
| `/pripadove-studie/` + `/pripadove-studie/<slug>/` | Přehled a detaily (obsah z `caseStudies.json`) |
| `/reference/` | Seznam klientů |
| `/o-nas/`, `/kontakt/`, `/ochrana-osobnich-udaju/`, `404.html` | |

## Úprava obsahu

Veškeré texty a seznamy jsou v `src/_data/*.json`, šablony se nemusí sahat.

- **Loga klientů** – do `clients.json` přidat `"logo": "/assets/img/logos/nazev.svg"`; bez loga se zobrazí název textem.
- **Screenshoty případovek** – do `caseStudies.json` přidat `"screenshot": "/assets/img/projekty/nazev.jpg"` (ideálně 1600×700). Pole `todo` je jen poznámka, nikde se nezobrazuje.
- **Fotky týmu** – do `team.json` přidat `"photo": "/assets/img/tym/jmeno.jpg"` (formát 4:5 nebo 1:1).
- **Kontaktní formulář** – do `site.json` nastavit `formEndpoint` (např. Formspree, Make webhook, vlastní API přijímající JSON `{name, email, message}`). Dokud je prázdný, formulář otevře předvyplněný e-mail.
- **Sociální sítě** – URL v `site.json › social` jsou předvyplněné odhadem, nutno ověřit.
- **Ochrana osobních údajů** – v `src/ochrana-osobnich-udaju.njk` doplnit IČO a sídlo (místa označená `[doplnit]`).

## Design systém

Styl „Kinetic Typography“ v firemních barvách: akcent `#FD5B38` (oranžová z loga), pozadí `#09090B`, text `#FAFAFA`, linky `#3F3F46`. Vše uppercase v display velikostech, ostré rohy, 2px rámečky, žádné stíny ani gradienty. Tokeny jsou v `src/styles/main.css` v bloku `@theme` – změna barvy na jednom místě se propíše všude.

Pohyb: nekonečné CSS marquee, reveal při scrollu (Motion `inView`), paralaxa hero, sticky karty postupu, inverze barev na hover. Vše respektuje `prefers-reduced-motion`.
