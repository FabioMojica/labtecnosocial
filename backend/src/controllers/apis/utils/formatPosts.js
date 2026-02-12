function normalizeReactionsByType(reactions) {
  const base = {
    LIKE: 0,
    LOVE: 0,
    WOW: 0,
    HAHA: 0,
    SAD: 0,
    ANGRY: 0,
  };

  if (!reactions?.data) return base;

  reactions.data.forEach(r => {
    if (base[r.type] !== undefined) {
      base[r.type]++;
    }
  });

  return base;
}

export function formatPopularPosts(posts, limit = 5) {
  if (!Array.isArray(posts)) return [];

  const formatted = posts.map(post => {
    const reactionsByType = normalizeReactionsByType(post.reactions);

    const totalReactions = Object.values(reactionsByType)
      .reduce((a, b) => a + b, 0);

    const sharesCount = post.shares?.count ?? 0;

    const commentsCount =
      post.comments?.summary?.total_count ?? 0;

    const popularityScore =
      totalReactions + commentsCount * 2 + sharesCount * 3;

    return {
      id: post.id,
      message: post.message ?? "",
      created_time: post.created_time,
      permalink_url: post.permalink_url,
      full_picture: post.full_picture,

      reactions: {
        byType: reactionsByType,
        total: totalReactions,
      },

      comments: commentsCount,
      shares: sharesCount,
      popularityScore,

      meta: {
        is_published: post.is_published,
        is_popular: post.is_popular,
        is_eligible_for_promotion: post.is_eligible_for_promotion,
      }
    };
  });

  return formatted
    .filter(p => p.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
}
