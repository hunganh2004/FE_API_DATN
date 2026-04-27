import slugifyLib from 'slugify';

export const createSlug = (text) =>
  slugifyLib(text, { lower: true, strict: true, locale: 'vi' });
