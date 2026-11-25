// boardSummary — a small, standalone summary of a token-radar board.
//
// This file does not build the board and does not read any snapshot. It
// takes the finished rows (the same shape the board writer produces) and
// answers the questions a reader asks first: how many rows are there, how
// many came from the watchlist, what the middle row is worth, who sits at
// the top, and how the rows spread across categories and chains.
//
// It is deliberately self-contained: the row type is defined here, there
// are no imports from the rest of the entry, and only the TypeScript
// standard library is used. That way the summary can be checked, reused
// or dropped without touching the scoring code.

export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string;
  chains: string[];
  tvl_usd: number;
  implied_value_usd: number;
  watchlist: boolean;
}

export interface TopRow {
  rank: number;
  slug: string;
  name: string;
  implied: number;
}

export interface CountEntry {
  name: string;
  count: number;
}

export interface BoardSummary {
  /** Number of rows on the board. */
  total: number;
  /** Rows that were on the watchlist. */
  watchlist: number;
  /** Rows found beyond the watchlist. */
  early: number;
  /** Median implied value across all rows, in USD. */
  medianImplied: number;
  /** The five highest-ranked rows, in rank order. */
  topFive: TopRow[];
  /** Rows per category, most common first. */
  categories: CountEntry[];
  /** Rows per chain, most common first. */
  chains: CountEntry[];
  /** Smallest implied value on the board, in USD. */
  minImplied: number;
  /** Largest implied value on the board, in USD. */
  maxImplied: number;
}

/**
 * Median of a list of numbers. Returns 0 for an empty list. For an even
 * count the two middle values are averaged, which keeps the median honest
 * instead of silently favouring one side.
 */
function medianOf(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Turn a list of labels into counts, sorted by count descending and then
 * by name ascending, so ties come out in a stable, readable order.
 */
function sortedCounts(labels: string[]): CountEntry[] {
  const counts = new Map<string, number>();
  for (const label of labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function emptySummary(): BoardSummary {
  return {
    total: 0,
    watchlist: 0,
    early: 0,
    medianImplied: 0,
    topFive: [],
    categories: [],
    chains: [],
    minImplied: 0,
    maxImplied: 0,
  };
}

/**
 * Summarise a finished board.
 *
 * The input is expected to be ranked already (rank 1 first), but the
 * function does not trust that: the top five are taken by rank, the
 * median and the range are computed from the implied values themselves,
 * and the category and chain counts are built from the rows as given.
 * A row with no chains simply contributes nothing to the chain counts.
 */
export function boardSummary(rows: BoardRow[]): BoardSummary {
  if (rows.length === 0) {
    return emptySummary();
  }

  const watchlist = rows.filter((row) => row.watchlist).length;
  const impliedValues = rows.map((row) => row.implied_value_usd);

  const byRank = [...rows].sort((a, b) => a.rank - b.rank);
  const topFive: TopRow[] = byRank.slice(0, 5).map((row) => ({
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    implied: row.implied_value_usd,
  }));

  const categories = sortedCounts(rows.map((row) => row.category));
  const chainLabels: string[] = [];
  for (const row of rows) {
    for (const chain of row.chains) {
      chainLabels.push(chain);
    }
  }
  const chains = sortedCounts(chainLabels);

  return {
    total: rows.length,
    watchlist,
    early: rows.length - watchlist,
    medianImplied: medianOf(impliedValues),
    topFive,
    categories,
    chains,
    minImplied: Math.min(...impliedValues),
    maxImplied: Math.max(...impliedValues),
  };
}
