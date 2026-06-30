# Graph Report - .  (2026-06-28)

## Corpus Check
- Corpus is ~12.836 words - fits in a single context window. You may not need a graph.

## Summary
- 24 nodes · 23 edges · 5 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 14 · imports_from: 5 · imports: 4

## God Nodes (most connected - your core abstractions)
1. `routing` - 5 edges
2. `__filename` - 1 edges
3. `__dirname` - 1 edges
4. `compat` - 1 edges
5. `withNextIntl` - 1 edges
6. `nextConfig` - 1 edges
7. `config` - 1 edges
8. `metadata` - 1 edges
9. `IMG` - 1 edges
10. `OVERLAYS` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "i18n & Locale Routing"
Cohesion: 0.36
Nodes (3): routing, metadata, config

### Community 1 - "Page & Navigation Components"
Cohesion: 0.33
Nodes (3): { Link, redirect, usePathname, useRouter }, IMG, OVERLAYS

### Community 2 - "ESLint Configuration"
Cohesion: 0.50
Nodes (3): compat, __dirname, __filename

### Community 3 - "Next.js Config & Plugins"
Cohesion: 0.67
Nodes (2): nextConfig, withNextIntl

### Community 4 - "PostCSS & Tailwind Build"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **11 isolated node(s):** `__filename`, `__dirname`, `compat`, `withNextIntl`, `nextConfig` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Next.js Config & Plugins`** (2 nodes): `nextConfig`, `withNextIntl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS & Tailwind Build`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `routing` connect `i18n & Locale Routing` to `Page & Navigation Components`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `compat` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._