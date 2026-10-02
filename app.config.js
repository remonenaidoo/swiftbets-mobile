// The brand is fixed at build time (EXPO_PUBLIC_BRAND); app.json holds everything else.
const swiftplay = process.env.EXPO_PUBLIC_BRAND === 'swiftplay';
const name = swiftplay ? 'SwiftPlay' : 'SwiftBets';
const surface = swiftplay ? '#120d1f' : '#0e1621';

module.exports = ({ config }) => ({
  ...config,
  name,
  web: { ...config.web, name, shortName: name, themeColor: surface, backgroundColor: surface },
});
