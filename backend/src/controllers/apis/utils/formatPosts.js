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

function pickPostText(post) {
  const directMessage = typeof post?.message === "string" ? post.message.trim() : "";
  if (directMessage) return directMessage;

  const story = typeof post?.story === "string" ? post.story.trim() : "";
  if (story) return story;

  const attachment = post?.attachments?.data?.[0];
  const attachmentDescription =
    typeof attachment?.description === "string" ? attachment.description.trim() : "";
  if (attachmentDescription) return attachmentDescription;

  const attachmentTitle =
    typeof attachment?.title === "string" ? attachment.title.trim() : "";
  if (attachmentTitle) return attachmentTitle;

  return "";
}

function getReactionsFromSummary(post) {
  return {
    LIKE: post?.reactions_like?.summary?.total_count ?? 0,
    LOVE: post?.reactions_love?.summary?.total_count ?? 0,
    WOW: post?.reactions_wow?.summary?.total_count ?? 0,
    HAHA: post?.reactions_haha?.summary?.total_count ?? 0,
    SAD: post?.reactions_sad?.summary?.total_count ?? 0,
    ANGRY: post?.reactions_angry?.summary?.total_count ?? 0,
  };
}

export function formatPopularPosts(posts, limit = 5) {
  if (!Array.isArray(posts)) return [];

  const formatted = posts.map(post => {
    const reactionsByTypeFromSummary = getReactionsFromSummary(post);
    const hasSummaryByType = Object.values(reactionsByTypeFromSummary).some(v => v > 0);
    const reactionsByType = hasSummaryByType
      ? reactionsByTypeFromSummary
      : normalizeReactionsByType(post.reactions);

    const totalReactionsFromSummary = post?.reactions?.summary?.total_count;
    const totalReactions = Number.isFinite(totalReactionsFromSummary)
      ? totalReactionsFromSummary
      : Object.values(reactionsByType).reduce((a, b) => a + b, 0);

    const sharesCount = post.shares?.count ?? 0;

    const commentsCount =
      post.comments?.summary?.total_count ?? 0;

    const popularityScore =
      totalReactions + commentsCount * 2 + sharesCount * 3;

    return {
      id: post.id,
      message: pickPostText(post),
      created_time: post.created_time,
      updated_time: post.updated_time,
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
