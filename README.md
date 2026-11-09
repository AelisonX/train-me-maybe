# Train Me Maybe

A tiny game where you train your own pocket LLM and watch a town react to what it learns.

**Build Your Own Pocket LLM · Playable prototype v0.3**

Meet Lulu, a white pixel cube with an alarming amount of civic influence. Choose 2–3 training notices, generate two drafts, and stamp one. The town acts on the announcement—and the consequences become tomorrow’s reading material.

## Play

Open `index.html` in a browser that runs JavaScript. No build, installation, paid API or inference server is required. Mobile file-preview apps may not run scripts; use a hosted browser URL instead.

To publish with GitHub Pages: repository Settings → Pages → Deploy from a branch → main → / (root) → Save.

## What is inside

- Three game days: choose cards → generate → stamp → consequences → new cards.
- Unlimited redraws and card reselection before stamping.
- English and Simplified Chinese display options.
- Pixel town, towing, pigeon enforcement, a dump-side town hall and a possible Pigeon Council ending.
- Local saves; no gameplay account or cloud inference requirement.

Lulu uses a real count-based **word bigram language model**, not a neural LLM. Both drafts are raw independent samples: no hidden filtering, forced chaos rate or deduplication. The model writes the notice; field reports and character quotes are authored game content. New combinations are not automatically errors.

Chinese is a display translation of the same English model, not a separately trained Chinese model. Yesterday’s notice is only trained on again if you choose its card.

## Develop and test

Source: `core.js` (model/rules), `i18n.js` (translations), `ui.js` (interaction), `page.html` (layout/pixel scene).

```sh
python build.py
node test_game.js
node test_retry_language.js
node audit_all_histories.js
python make_report.py
```

The build writes the self-contained root `index.html`. The exhaustive audit generates conditional event-probability CSV and model-card JSON files locally; these large reproducible outputs are not checked in. Summary results are in `test-results-v03/` and `TEST_REPORT.md`.

This upload preserves the v0.3 gameplay from the tested deployed prototype. Progress uses localStorage key `train-me-maybe-v03`; saves on different website origins are separate.

