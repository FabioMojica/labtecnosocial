export const normalizeGetAPIsData = (platform, data) => {
  switch (platform) {
    case 'github':
      return (Array.isArray(data) ? data : []).map((repo) => ({
        id: repo.id,
        name: repo.name,
        url: `https://github.com/${repo.full_name || repo.name}`,
        image_url: repo.owner?.avatar_url
      }));

    case 'facebook':
      return (data?.pages || []).map((page) => ({
        id: page.id,
        name: page.name,
        url: page.link,
        image_url: page.picture?.data?.url
      }));

    case 'instagram':
      return (data?.pages || []).map((page) => ({
        id: page.id,
        name: page.name,
        url: page.url,
        image_url: page.image_url
      }));

    case 'twitter':
      return (data?.pages || []).map((page) => ({
        id: page.id,
        name: page.name,
        url: page.url,
        image_url: page.image_url
      }));

    default:
      return [];
  }
};
