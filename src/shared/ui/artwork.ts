import type { ImageSourcePropType } from 'react-native';

/** Every icon from the SwiftBets artwork, bundled statically so Metro ships them with the web build and the APK. */
export const icons = {
  'sports/basketball': require('../../../assets/ui/sports/basketball.png'),
  'sports/boxing': require('../../../assets/ui/sports/boxing.png'),
  'sports/cricket': require('../../../assets/ui/sports/cricket.png'),
  'sports/esports': require('../../../assets/ui/sports/esports.png'),
  'sports/football': require('../../../assets/ui/sports/football.png'),
  'sports/golf': require('../../../assets/ui/sports/golf.png'),
  'sports/horse-racing': require('../../../assets/ui/sports/horse-racing.png'),
  'sports/live': require('../../../assets/ui/sports/live.png'),
  'sports/motorsport': require('../../../assets/ui/sports/motorsport.png'),
  'sports/rugby': require('../../../assets/ui/sports/rugby.png'),
  'sports/tennis': require('../../../assets/ui/sports/tennis.png'),
  'sports/trophy': require('../../../assets/ui/sports/trophy.png'),
  'casino/cards': require('../../../assets/ui/casino/cards.png'),
  'casino/chips': require('../../../assets/ui/casino/chips.png'),
  'casino/crash': require('../../../assets/ui/casino/crash.png'),
  'casino/dice': require('../../../assets/ui/casino/dice.png'),
  'casino/gift': require('../../../assets/ui/casino/gift.png'),
  'casino/jackpot': require('../../../assets/ui/casino/jackpot.png'),
  'casino/live-dealer': require('../../../assets/ui/casino/live-dealer.png'),
  'casino/quick': require('../../../assets/ui/casino/quick.png'),
  'casino/roulette': require('../../../assets/ui/casino/roulette.png'),
  'casino/slots': require('../../../assets/ui/casino/slots.png'),
  'casino/star': require('../../../assets/ui/casino/star.png'),
  'casino/vip': require('../../../assets/ui/casino/vip.png'),
  'nav/account': require('../../../assets/ui/nav/account.png'),
  'nav/betslip': require('../../../assets/ui/nav/betslip.png'),
  'nav/casino': require('../../../assets/ui/nav/casino.png'),
  'nav/chat': require('../../../assets/ui/nav/chat.png'),
  'nav/coins': require('../../../assets/ui/nav/coins.png'),
  'nav/deposit': require('../../../assets/ui/nav/deposit.png'),
  'nav/heart': require('../../../assets/ui/nav/heart.png'),
  'nav/home': require('../../../assets/ui/nav/home.png'),
  'nav/menu': require('../../../assets/ui/nav/menu.png'),
  'nav/my-bets': require('../../../assets/ui/nav/my-bets.png'),
  'nav/notifications': require('../../../assets/ui/nav/notifications.png'),
  'nav/promotions': require('../../../assets/ui/nav/promotions.png'),
  'nav/safer-gambling': require('../../../assets/ui/nav/safer-gambling.png'),
  'nav/search': require('../../../assets/ui/nav/search.png'),
  'nav/settings': require('../../../assets/ui/nav/settings.png'),
  'nav/sports': require('../../../assets/ui/nav/sports.png'),
  'nav/transactions': require('../../../assets/ui/nav/transactions.png'),
  'nav/withdraw': require('../../../assets/ui/nav/withdraw.png'),
} satisfies Record<string, ImageSourcePropType>;

export type IconName = keyof typeof icons;

export const games = {
  'crazy-wheel': require('../../../assets/ui/games/crazy-wheel.jpg'),
  'deep-blue': require('../../../assets/ui/games/deep-blue.jpg'),
  'gold-rush': require('../../../assets/ui/games/gold-rush.jpg'),
  'jet-rush': require('../../../assets/ui/games/jet-rush.jpg'),
  'jungle-kong': require('../../../assets/ui/games/jungle-kong.jpg'),
  'lightning-roulette': require('../../../assets/ui/games/lightning-roulette.jpg'),
  'lucky-lion': require('../../../assets/ui/games/lucky-lion.jpg'),
  'neon-sevens': require('../../../assets/ui/games/neon-sevens.jpg'),
  'rocket': require('../../../assets/ui/games/rocket.jpg'),
  'rose-nights': require('../../../assets/ui/games/rose-nights.jpg'),
  'sun-temple': require('../../../assets/ui/games/sun-temple.jpg'),
  'vip-blackjack': require('../../../assets/ui/games/vip-blackjack.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export const banners = {
  casino: require('../../../assets/ui/banners/casino.webp'),
  football: require('../../../assets/ui/banners/football.webp'),
  win: require('../../../assets/ui/banners/win.webp'),
} satisfies Record<string, ImageSourcePropType>;

export const brand = {
  logo: require('../../../assets/ui/brand/logo-on-dark.png'),
  mark: require('../../../assets/ui/brand/mark.png'),
} satisfies Record<string, ImageSourcePropType>;
