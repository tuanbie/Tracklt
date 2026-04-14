export const BUILTIN_GROUP_KEYS = [
  'living',
  'food',
  'transport',
  'bills',
  'income',
  'other',
] as const;

export type BuiltinGroupKey = (typeof BUILTIN_GROUP_KEYS)[number];

export function isBuiltinGroupKey(s: string): s is BuiltinGroupKey {
  return (BUILTIN_GROUP_KEYS as readonly string[]).includes(s);
}
