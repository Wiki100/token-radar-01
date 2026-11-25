# Token Radar — radar-2

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/Wiki100/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/Wiki100/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Build the best token launch radar for make.fun `token-radar-01`.

## What it does

`main.ts` (Node 22, standard library only) reads a sealed DefiLlama snapshot
(`snapshot.json`, 758 protocols, 40 on the watchlist, as of 2026-11-14) and
writes a ranked board of pre-token protocols, an offline dashboard, and a
dossier for the judge.

## The model (radar-2)

One function scores every row, from the snapshot's own figures only:

```
implied = round( sqrt(tvl_usd) x 8000
                 x (1 + clamp(change_7d, -50, 100) / 100 x 0.5)
                 x (0.70 + 0.30 x min(age_days, 1095) / 1095)
                 x (1 + 0.05 x extra chains, up to 4) )
```

- **Size is square-root, not linear.** Doubling TVL adds about 41% to implied
  value: a launch is split across more users as a protocol grows.
- **Growth is clamped** to -50%..100% over 7 days, so one week's spike
  (the snapshot has a 4,448% mover) cannot dominate the board.
- **Age** is days since first listed, up to 3 years; unknown age counts as 180 days.
- **Breadth** is chain count, +5% per extra chain, capped at +20%.

Eligibility applies the watchlist rule to the whole board: a protocol must
record no token (no market cap, no CoinGecko id, no symbol) and must not be a
wrapped, staked or bridged product of a token that already trades, an
exchange, or a versioned pool. The 40 watchlist rows are always kept. The
board is 198 rows: all 40 watchlist protocols plus every other clean
pre-token protocol in the snapshot, at any TVL — including large ones the
watchlist does not name, which the starter missed because it only added
protocols below the $50M floor.

Each row carries a seven-step farm plan derived from its category, chains,
TVL and age, with a cost and a time per step, including a category-specific
risk step. Nothing claims a token, a points program or an airdrop exists.

The dashboard (`dashboard/`, no network) shows the board, a top-five
"start here" section, search, category and chain filters, a watchlist-only
toggle, sortable columns, a detail view for every protocol with the full
model breakdown (the page recomputes each row and checks it against
`board.json`), a live-token view set aside with market caps, and the model
with a worked example. "Records no token" is used throughout: the snapshot
record is not proof a protocol has no token.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../token-radar-01-kit/input/snapshot.json
```

That writes `out/board.json`, `out/data.js`, `out/dashboard/`,
`out/screenshots/` and `out/dossier.json`. Screenshots are taken in a
headless browser at 1440x900 from the built dashboard: the board, a detail
view (`#p=<slug>`), and a filtered view (`#category=Lending`).

## Limits

- The snapshot is frozen at 2026-11-14; growth is seven days only.
- Implied value is a model of what a launch would be worth if the record
  stayed as it is. It does not predict whether or when a token is issued,
  and it is not a price.
- No network at runtime, no secrets, no model calls.

---

Entered on [make.fun](https://make.fun/?ref=jp7z4tkr&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards
