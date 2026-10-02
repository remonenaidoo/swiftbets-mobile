import { bannerFrame } from './components/PromoCarousel';

describe('banner framing', () => {
  it('puts the subject 72% across the slide, beside the text', () => {
    const { left, width } = bannerFrame(754, 260);
    expect(Math.round(((left + width * 0.62) / 754) * 100)).toBe(72);
  });

  it('never pulls the banner far enough left to expose its right edge', () => {
    const { left, width } = bannerFrame(1300, 160);
    expect(left + width).toBeGreaterThanOrEqual(1300);
  });
});
