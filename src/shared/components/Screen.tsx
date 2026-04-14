import type { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Root screen wrapper with semantic background from the theme (`bg-background`).
 */
export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}
