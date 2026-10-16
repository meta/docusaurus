/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {FacetFilters} from 'algoliasearch/lite';

export function mergeFacetFilters(
  f1: FacetFilters,
  f2: FacetFilters,
): FacetFilters;

export function mergeFacetFilters(
  f1: FacetFilters | undefined,
  f2: FacetFilters | undefined,
): FacetFilters | undefined;

export function mergeFacetFilters(
  f1: FacetFilters | undefined,
  f2: FacetFilters | undefined,
): FacetFilters | undefined {
  if (f1 === undefined) {
    return f2;
  }
  if (f2 === undefined) {
    return f1;
  }

  const normalize = (f: FacetFilters): FacetFilters =>
    typeof f === 'string' ? [f] : f;

  // Historical behavior: we flatten everything
  // TODO I'm pretty sure this is incorrect
  //  see https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/?client=javascript
  //  Note: Algolia is working to provide a reliable facet merging strategy
  //  see https://github.com/meta/docusaurus/pull/11327#issuecomment-3284742923
  return [...normalize(f1), ...normalize(f2)];
}

// Escape a value for use inside a double-quoted Algolia `filters` string.
// See https://www.algolia.com/doc/api-reference/api-parameters/filters/
function quoteFilterValue(value: string): string {
  // Already quoted by the user: leave as-is
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value;
  }
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// Convert a single Algolia `facetFilters` leaf ("attr:value" / "attr:-value")
// into an equivalent clause of the `filters` grammar ("attr:"value"" /
// "NOT attr:"value"").
// Returns undefined for leaves that carry no meaning (empty strings).
function facetFilterToFilterClause(leaf: string): string | undefined {
  const trimmed = leaf.trim();
  if (!trimmed) {
    return undefined;
  }

  const separatorIndex = trimmed.indexOf(':');
  // Not a facet filter (no "attr:value" shape): assume the user hand-wrote a
  // `filters` clause and pass it through untouched
  if (separatorIndex <= 0) {
    return trimmed;
  }

  const attribute = trimmed.slice(0, separatorIndex);
  let value = trimmed.slice(separatorIndex + 1);

  // facetFilters negates with "attr:-value", filters negates
  // with "NOT attr:value"
  const negated = value.startsWith('-');
  if (negated) {
    value = value.slice(1);
  }
  if (!value) {
    return undefined;
  }

  const clause = `${attribute}:${quoteFilterValue(value)}`;
  return negated ? `NOT ${clause}` : clause;
}

// Handles nested `facetFilters` to string conversions
// Algolia alternates the operator by depth: the outer array is AND, the next
// level is OR, and so on. Returns undefined when nothing meaningful remains.
function facetFiltersToFilterStringInternal(
  node: FacetFilters,
  depth: number,
): string | undefined {
  if (typeof node === 'string') {
    return facetFilterToFilterClause(node);
  }

  const operator = depth % 2 === 0 ? ' AND ' : ' OR ';
  const clauses = node
    .map((child) => facetFiltersToFilterStringInternal(child, depth + 1))
    .filter((clause): clause is string => clause !== undefined);

  if (clauses.length === 0) {
    return undefined;
  }
  if (clauses.length === 1) {
    return clauses[0];
  }

  const joined = clauses.join(operator);
  // Nested groups need parens; the top level is already unambiguous
  return depth === 0 ? joined : `(${joined})`;
}

export function facetFiltersToFilterString(facetFilters: FacetFilters): string {
  return facetFiltersToFilterStringInternal(facetFilters, 0) ?? '';
}

export function mergeFilters(
  existing: string | undefined,
  added: string | undefined,
): string {
  if (!existing) {
    return added ?? '';
  }

  if (!added) {
    return existing;
  }

  return `(${existing}) AND (${added})`;
}
