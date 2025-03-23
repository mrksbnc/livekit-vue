export function roomOptionsStringifyReplacer(key: string, val: unknown): unknown {
  if (key === 'processor' && val && typeof val === 'object' && 'name' in val) {
    return val.name;
  }
  if (key === 'e2ee' && val) {
    return 'e2ee-enabled';
  }
  return val;
}
