import { render, screen } from '@testing-library/react-native';
import { FixturesScreen } from './FixturesScreen';

describe('FixturesScreen', () => {
  it('shows the empty state heading', () => {
    render(<FixturesScreen />);

    expect(screen.getByRole('header')).toHaveTextContent('No fixtures yet');
  });
});
