import { Image } from 'react-native';
import { icons, type IconName } from './artwork';

/** One of the SwiftBets icons at a given size; decorative unless given a label. */
export function Icon({ name, size = 24, label }: { name: IconName; size?: number; label?: string }) {
  return <Image source={icons[name]} style={{ width: size, height: size }} accessibilityLabel={label} aria-hidden={label ? undefined : true} />;
}
