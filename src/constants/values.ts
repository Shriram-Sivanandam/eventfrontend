type GenderOption = { value: string; label: string; icon: string };
export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Male', icon: '♂️' },
  { value: 'female', label: 'Female', icon: '♀️' },
  { value: 'non_binary', label: 'Non-binary', icon: '⚧️' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
];

const TAG_COLORS = ['#FF6B35', '#E63946', '#2EC4B6', '#8338EC', '#FFBE0B'];
export function tagColor(id: string) {
  return TAG_COLORS[id.charCodeAt(0) % TAG_COLORS.length];
}
