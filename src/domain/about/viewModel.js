const ABOUT_FALLBACK_FIELDS = [
  'professionTitle',
  'briefBio',
  'profileImageUrl',
  'resumeUrl',
];

export function mergeAboutData(data = {}, previous = {}) {
  return ABOUT_FALLBACK_FIELDS.reduce((merged, field) => {
    merged[field] = data?.[field] || previous?.[field] || '';
    return merged;
  }, {});
}
