import type { UserTransactionGroup } from '../../store/transactionGroupStore';
import { CUSTOM_GROUP_PREFIX } from '../../store/transactionGroupStore';
import { isBuiltinGroupKey } from './builtinGroups';

export function resolveTransactionGroupLabel(
  groupKey: string,
  t: (key: string) => string,
  customGroups: UserTransactionGroup[],
  deletedLabel: string,
): string {
  if (groupKey.startsWith(CUSTOM_GROUP_PREFIX)) {
    const id = groupKey.slice(CUSTOM_GROUP_PREFIX.length);
    const found = customGroups.find((g) => g.id === id);
    return found?.name ?? deletedLabel;
  }
  if (isBuiltinGroupKey(groupKey)) {
    return t(`newTransaction.groups.${groupKey}`);
  }
  return groupKey;
}
