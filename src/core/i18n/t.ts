import type { TranslationTree } from './translations';

/** Dot-path into TranslationTree, e.g. "settings.title" */
export function translate(
  tree: TranslationTree,
  path: string,
): string {
  const parts = path.split('.');
  let cur: unknown = tree;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      return path;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : path;
}
