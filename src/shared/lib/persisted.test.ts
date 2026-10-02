import { persisted } from './persisted';

const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => void mockStore.set(key, value)),
  deleteItemAsync: jest.fn(async (key: string) => void mockStore.delete(key)),
}));

describe('persisted ui state', () => {
  it('reads back what it wrote', async () => {
    await persisted.write('slip', [{ fixtureId: 'f1', odds: 2.5 }]);

    await expect(persisted.read('slip')).resolves.toEqual([{ fixtureId: 'f1', odds: 2.5 }]);
  });

  it('treats a corrupt value as nothing saved instead of failing', async () => {
    mockStore.set('slip', '{not json');

    await expect(persisted.read('slip')).resolves.toBeNull();
  });
});
