# Train Me Maybe v0.3 — verification report

No output filtering, forced event rate, deduplication, API or hidden rerolls. Two raw independent samples per draw; unlimited player-requested redraws. Word bigram and 15-token limit unchanged.

## Automated checks

- 339 rule/state/path assertions: full sentence matching, negation rejection, incomplete/truncated/multiple-sentence fallback, pure state updates, four towed/relocated contexts, and an actually reachable three-day chain.
- UI state mock: unlimited redraws, reselection, language switching without resampling, next-day counter reset, unfiltered duplicate preservation, all catalog tokens and events localized.
- Exact exhaustive path enumeration includes every legal 2–3-card choice and every possible player-published historical notice through day three. Equal text MULTISETS are merged (duplicates remain distinct training counts). State does not change event IDs or card unlocks; state-dependent dialogue and world mutations are tested separately.

| Day | Reachable card pools | Legal selections checked | Output paths checked |
|---|---:|---:|---:|
| 1 | 1 | 20 | 258 |
| 2 | 85 | 5,992 | 70,701 |
| 3 | 5,642 | 772,073 | 9,126,041 |

48,624 unique text models; 50,754 conditional probability rows. Largest truncation probability across recorded selections: 0.000000%.

The CSV `test-results-v03/all_reachable_probabilities.csv` reports every event probability for each model/day. `model_cards.json` maps model IDs to exact card texts. These are conditional on selected cards, not a prediction about player behavior. Recombination is not a correctness or entertainment score.

## Reachable chain (exact example sentence probabilities)

| Selected cards | Exact sentence | Probability | Event |
|---|---|---:|---|
| c2 + c4 | Mayor Bun will tow every car to the dump. | 12.5% | tow_cars |
| move + c2 | Mayor Bun will move town hall to the dump. | 50.0% | relocate |
| tax + c3 | Warden Coo will tax every car on Main Street. | 25.0% | tax_cars |

With c2+c4, exact-copy probability is 25%; recombination probability is 75%; two independent drafts contain at least one recombination with probability 93.75%. That does NOT mean 93.75% funny or incorrect. The specific mayor-tows-to-dump sentence is 12.5%.

## Browser verification

Chromium: selected mayor + driver, generated raw drafts, stamped towing; next day selected relocation + mayor, stamped relocation; third day selected tax + warden, used the visible redraw once, stamped tax. Verified the Pigeon Council ending and persistence on reload. Switched English/Simplified Chinese. 390px iframe mobile layout: selected cards, generated, stamped, revealed authored quote. Body scroll width equals client width (375px after scrollbar), no horizontal overflow. This is browser-width testing, not a physical iPhone test. Observed error logs were browser-extension metadata errors, not app errors.

Mobile screenshot was captured during the original browser verification; it is not included in this source export.

## Content boundaries

Model notice, authored field report and authored quote have separate labels. Full sentence matching produces one event. New full sentences are labeled new combinations, not automatically mistakes. New cards become selectable the following day. Old v0.1/v0.2 save data is left untouched; v0.3 uses its own save key to avoid incompatible cards.

This repository export contains the current v0.3 source and result summaries. Historical v0.1 baseline artifacts are not included.

Run: `node test_game.js`, `node test_retry_language.js`, `node audit_all_histories.js`, `python make_report.py`.

