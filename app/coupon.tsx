import { pageTitle } from '../src/shared/brand';
import Head from 'expo-router/head';
import { CouponScreen } from '../src/features/coupon/components/CouponScreen';

export default function CouponRoute() {
  return (
    <>
      <Head>
        <title>{pageTitle("Today's coupon")}</title>
      </Head>
      <CouponScreen />
    </>
  );
}
