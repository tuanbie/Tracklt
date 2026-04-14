import { useColorScheme } from 'nativewind';

/** Effective palette after applying system / light / dark preference. */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}
