import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Betslip } from '../../features/betslip/components/Betslip';
import { BetslipSheet } from '../../features/betslip/components/BetslipSheet';
import { usePersistedSlip } from '../../features/betslip/state/usePersistedSlip';
import { useIsWide } from './Layout';
import { BottomNav } from './shell/BottomNav';
import { Header } from './shell/Header';
import { SideMenu } from './shell/SideMenu';
import { Toast } from './Toast';
import { colors, maxContentWidth } from './theme';

/** Desktop: left menu, content, betslip on the right. Phones: content with a bottom bar and a betslip sheet. */
export function AppFrame({ children }: { children: ReactNode }) {
  const wide = useIsWide();
  usePersistedSlip();

  return (
    <View style={styles.root}>
      <Header />
      <View style={[styles.body, wide && styles.bodyWide]}>
        {wide ? <SideMenu /> : null}
        <View style={styles.main}>{children}</View>
        {wide ? (
          <View style={styles.slip}>
            <Betslip />
          </View>
        ) : null}
      </View>
      {wide ? null : <BottomNav />}
      {wide ? null : <BetslipSheet />}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1 },
  bodyWide: { flexDirection: 'row', width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  main: { flex: 1, minWidth: 0 },
  slip: { width: 340, flexGrow: 0, flexShrink: 0, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surfaceRaised },
});
