# Token Radar — Method (radar-2)

## What the board is

The board is a ranked list of **198 pre-token protocols**: projects that
hold real value on-chain but, as far as the sealed snapshot records, have
not issued a token yet. It is a radar, not a leaderboard of existing
tokens. Each row answers one question: if this protocol launched a token
tomorrow and the launch were worth roughly what the protocol is worth
today, how large would that launch be?

The board has two parts:

- **40 watchlist rows.** These are the protocols the snapshot's watchlist
  names explicitly. They are always kept, whatever else the model says.
- **158 early finds.** These are the other clean pre-token protocols in
  the snapshot. They are the point of the radar: the watchlist alone
  misses large, interesting protocols that nobody has flagged yet.

The board is sorted by implied value, highest first. The median row is
worth about **$33.4M** on the model, and the last row about **$11.8M**.

## Where the data comes from

Everything is computed from a single sealed snapshot of DefiLlama data,
frozen on **2026-11-14**. The snapshot lists 758 protocols with their
total value locked (TVL), seven-day change, the date they were first
listed, the chains they run on, and whether any token record exists for
them. The board uses only those figures. No live prices, no social
signals, no outside data, and no network calls at run time.

Because the snapshot is frozen, the board is a picture of one day. A
protocol that launched a token after 2026-11-14, or whose TVL moved
sharply since, will not be reflected here.

## Eligibility: who gets on the board

A protocol only reaches the board if it clears every eligibility rule.
The rules are applied to the whole board, watchlist rows included in
spirit — the watchlist rows are kept, but the early finds must pass the
same screen, and no row is allowed to be a disguised version of something
that already trades.

A row is eligible when:

1. **It records no token.** The snapshot shows no market capitalisation,
   no CoinGecko id, and no symbol for it. "Records no token" is the
   honest wording: the snapshot is not proof that a protocol has no
   token anywhere, only that its record carries none.
2. **It is not a bridge.** Bridge and Canonical Bridge categories are
   out. A bridge moves value between chains; it is not the kind of
   protocol this radar is trying to rank.
3. **It is not a staking or restaking wrapper.** Liquid Staking, Liquid
   Restaking and Restaked BTC categories are out, as are names that are
   whole-word wrapped, staked or staking. These are usually a liquid
   wrapper around a token that already exists.
4. **It is not an exchange.** CEX categories and exchange-prefixed names
   are out. An exchange's token, if it has one, is a different story.
5. **It is not a versioned pool.** Names carrying a version marker are
   out. A versioned name usually denotes one deployment of a larger
   product, not a standalone protocol.

Anything that fails one of those tests is set aside, not re-scored. A
separate live-token view holds the protocols that do record a token, with
their market caps, so the reader can see what was excluded and why.

## The implied-value formula

Every eligible row gets one number, the implied value, from a single
formula applied identically to all rows:

```
implied = round(
  sqrt(tvl_usd) * 8000
  * (1 + clamp(change_7d, -50, 100) / 100 * 0.5)
  * (0.70 + 0.30 * min(age_days, 1095) / 1095)
  * (1 + 0.05 * min(max(chains - 1, 0), 4))
)
```

Each factor is explained below. Nothing in the formula is tuned per
protocol, and no name is special-cased. Two rows with the same TVL,
growth, age and chain count get the same implied value.

### Size: square-root in TVL

The base of the formula is `sqrt(tvl_usd) * 8000`. Size matters, but it
matters less than linearly: doubling TVL adds about 41% to implied value,
not 100%.

That is a deliberate choice. A launch is split across more users, more
liquidity and more attention as a protocol grows, so the marginal value
of each extra dollar locked falls. A straight linear formula would let
the handful of giants dominate the board and drown out everything else.
The square root keeps the giants at the top — they earned that — while
leaving room for smaller protocols to rank on their other merits.

### Growth: clamped seven-day change

The growth factor is `1 + clamp(change_7d, -50, 100) / 100 * 0.5`.

The seven-day change is clamped to the range -50% to +100% before it is
used, and then it is halved. So the strongest possible growth lifts a
row by 50%, and the worst possible fall cuts it by 25%.

The clamp matters because the snapshot contains extreme movers — one
protocol moved 4,448% in a week. Without a clamp, a single week's spike
would decide the board. With it, momentum is a nudge, not a verdict.
A protocol still has to be large, old and broad to sit near the top.

### Age: days since first listed

The age factor is `0.70 + 0.30 * min(age_days, 1095) / 1095`.

A protocol starts at 0.70 and gains up to 0.30 over three years, so the
oldest rows score 1.00 and the newest 0.70. Age is capped at 1,095 days
(three years): beyond that, extra years add nothing.

The reasoning is simple. A protocol that has survived three years has
survived market cycles, audits, migrations and competitors. A brand-new
protocol might be the next big thing, but it has not proven it yet. The
0.70 floor keeps new protocols in the game — they are not punished
harshly for being young — while rewarding the ones that lasted.

When the snapshot carries no first-listed date for a protocol, its age
is counted as **180 days**. That is a middle guess: not newborn, not
venerable, and it avoids letting a missing date silently become either
extreme.

### Breadth: how many chains

The breadth factor is `1 + 0.05 * min(max(chains - 1, 0), 4)`.

Each chain beyond the first adds 5%, up to four extra chains, for a
maximum of +20%. A protocol live on five or more chains scores the full
bonus; a single-chain protocol scores none.

Breadth is a proxy for reach and resilience. A multi-chain protocol has
more users to launch to, more liquidity venues, and less dependence on
any one chain's fortunes. The cap keeps breadth from overwhelming size:
being everywhere is worth a fifth extra, not a doubling.

## Farm plans

Every row carries a **seven-step farm plan**. The plan is derived from
the row's own category, chains, TVL and age, so a lending protocol's
plan reads differently from a yield protocol's, and a large protocol's
plan reads differently from a small one's.

Each step names an action, a cost and a time. The plan always includes:

- a **risk step** specific to the category — what can go wrong with this
  kind of protocol, and what to check before committing;
- a **position cap** — a limit on how much of a position this protocol
  should be, so no single row becomes the whole bet;
- a final unwind and logging step — how to exit, and how to record what
  happened.

The wording is careful throughout: a plan says "if it publishes one"
when it mentions a points page. Nothing in the board claims a token, a
points program or an airdrop exists, or that one will. Farming a
protocol that never launches is a real outcome, and the plans are
written for that possibility too.

## The dashboard

The board ships with an offline static dashboard: plain HTML, CSS and
JavaScript, with no network calls. It shows the board itself, a top-five
"start here" section, search, category and chain filters, a watchlist-only
toggle, sortable columns, and a detail view for every protocol with the
full model breakdown. The dashboard page recomputes each row and checks
it against the board file, so what the page shows and what the board
says cannot silently disagree.

There is also a live-token view, set aside from the main board, for the
protocols that do record a token, and a model panel that states the
formula, shows a worked example, and lists the limits below.

## Top five

The top five rows by implied value are:

| Rank | Protocol | Implied value |
| --- | --- | --- |
| 1 | steakhouse-financial | $422,912,823 |
| 2 | sentora-curator | $396,693,098 |
| 3 | gauntlet | $332,780,717 |
| 4 | veda | $317,696,815 |
| 5 | usdd | $244,542,018 |

These are the largest, oldest and broadest of the eligible protocols
under the model. They lead the board by a clear margin — the fifth row
is still worth more than seven times the median — which is why the
dashboard puts them in a "start here" section of their own.

## Limits

The board is honest about what it cannot do:

- **The snapshot is frozen at 2026-11-14.** Growth is seven days only,
  and anything that happened after the freeze is not in the board.
- **Implied value is a model, not a price.** It estimates what a launch
  would be worth if the protocol's record stayed as it is. It does not
  predict whether or when a token is issued, and it is not a price
  target.
- **"Records no token" is not proof.** The snapshot record is the only
  evidence used. A protocol could have a token the snapshot does not
  record, and the board would not know.
- **No network at run time.** The builder reads the sealed snapshot
  from disk and writes its outputs to disk. If the snapshot is wrong,
  the board inherits the error; there is no live check to catch it.
- **The model is simple on purpose.** Four factors, one formula, no
  per-protocol tuning. That makes the board auditable — anyone can
  recompute a row by hand — but it also means the board cannot see
  things the snapshot does not measure, like team quality, security
  history, or community strength.

Use the board as a starting point for research, not as a conclusion.
