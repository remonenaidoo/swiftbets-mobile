import { useLocalSearchParams } from 'expo-router';
import { ContentPageScreen } from '../../src/features/content/components/ContentPageScreen';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ContentPageScreen slug={slug ?? ''} />;
}
