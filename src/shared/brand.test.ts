describe('brand', () => {
  const load = (brand?: string) => {
    const before = process.env.EXPO_PUBLIC_BRAND;
    if (brand === undefined) delete process.env.EXPO_PUBLIC_BRAND;
    else process.env.EXPO_PUBLIC_BRAND = brand;
    let mod: typeof import('./brand') | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh module per brand needs a synchronous load
      mod = require('./brand');
    });
    process.env.EXPO_PUBLIC_BRAND = before;
    return mod!;
  };

  it('builds SwiftPlay with its own name and colours when asked', () => {
    const swiftplay = load('swiftplay');
    expect(swiftplay.pageTitle('Casino')).toBe('Casino · SwiftPlay');
    expect(swiftplay.brandTokens.color.accent).not.toBe(load('swiftbets').brandTokens.color.accent);
  });

  it('falls back to SwiftBets for an unknown or missing brand', () => {
    expect(load('nope').brandId).toBe('swiftbets');
    expect(load().brandName).toBe('SwiftBets');
  });
});
