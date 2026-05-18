function normalizeSortValue(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(number) ? number : 0;
}

function normalizeIdValue(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(number) ? number : Number.MAX_SAFE_INTEGER;
}

function compareBySortOrderThenId(a, b) {
  const sortOrderDiff = normalizeSortValue(a?.sortOrder) - normalizeSortValue(b?.sortOrder);
  if (sortOrderDiff !== 0) return sortOrderDiff;

  return normalizeIdValue(a?.id) - normalizeIdValue(b?.id);
}

function compareFeaturedProjects(a, b) {
  const rankDiff = normalizeSortValue(a?.featuredRank) - normalizeSortValue(b?.featuredRank);
  if (rankDiff !== 0) return rankDiff;

  return compareBySortOrderThenId(a, b);
}

function isFeaturedProject(project) {
  if (!project?.isFeatured) return false;
  if (project.featuredRank == null || project.featuredRank === '') return false;

  return Number.isSafeInteger(Number(project.featuredRank));
}

export function groupProjectsForDisplay(projects) {
  if (!Array.isArray(projects)) {
    return {
      featuredProjects: [],
      standardProjects: [],
    };
  }

  const featuredProjects = [];
  const standardProjects = [];

  projects.forEach((project) => {
    if (isFeaturedProject(project)) {
      featuredProjects.push(project);
      return;
    }

    standardProjects.push(project);
  });

  return {
    featuredProjects: [...featuredProjects].sort(compareFeaturedProjects),
    standardProjects: [...standardProjects].sort(compareBySortOrderThenId),
  };
}
