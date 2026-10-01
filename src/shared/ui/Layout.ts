import { useWindowDimensions } from 'react-native';
import { wideBreakpoint } from './theme';

export function useIsWide(): boolean {
  return useWindowDimensions().width >= wideBreakpoint;
}
