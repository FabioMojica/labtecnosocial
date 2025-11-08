import { faker } from "@faker-js/faker";

// Autores base
const baseAuthors = [
  {
    login: "PatrickGQ",
    email: "patrick.gonzales@ucb.edu.bo",
    avatar: "https://avatars.githubusercontent.com/u/173976969?v=4",
  },
  {
    login: "FabioMojica",
    email: "fabioandremojicaarmaza@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/175567542?v=4",
  },
  {
    login: "AdolfoDev",
    email: "adolfo.dev@example.com",
    avatar: faker.image.avatarGitHub(),
  },
  {
    login: "CodeMaster",
    email: "codemaster@example.com",
    avatar: faker.image.avatarGitHub(),
  },
];

// Generar 46 autores aleatorios para total de 50
const randomAuthors = Array.from({ length: 46 }, () => ({
  login: faker.internet.username(),
  email: faker.internet.email(),
  avatar: faker.image.avatarGitHub(),
}));

const allAuthors = [...baseAuthors, ...randomAuthors];

const pickAuthor = () => faker.helpers.arrayElement(allAuthors);

// Generador de fecha según período
const generateDateForPeriod = (period = 'lastMonth') => {
  let dateObj;
  switch (period) {
    case 'today':
      dateObj = faker.date.recent({ days: 0 });
      break;
    case 'lastWeek':
      dateObj = faker.date.recent({ days: 7 });
      break;
    case 'lastMonth':
      dateObj = faker.date.recent({ days: 30 });
      break;
    case 'lastSixMonths':
      dateObj = faker.date.recent({ days: 180 });
      break;
    case 'all':
    default:
      dateObj = faker.date.past({ years: 1 });
  }
  return dateObj.toISOString();
};

// Generador de commit individual
const generateCommit = (period = 'lastMonth') => {
  const sha = faker.string.alphanumeric(40);
  const nodeId = faker.string.alphanumeric(20);
  const author = pickAuthor();
  const date = generateDateForPeriod(period);

  return {
    sha,
    node_id: nodeId,
    commit: {
      author: { name: author.login, email: author.email, date },
      committer: { name: author.login, email: author.email, date },
      message: faker.hacker.phrase(),
      tree: { sha: faker.string.alphanumeric(40), url: faker.internet.url() },
      url: faker.internet.url(),
      comment_count: faker.number.int({ min: 0, max: 10 }),
      verification: {
        verified: faker.datatype.boolean(),
        reason: "unsigned",
        signature: null,
        payload: null,
        verified_at: null,
      },
    },
    url: faker.internet.url(),
    html_url: faker.internet.url(),
    comments_url: faker.internet.url(),
    author: {
      login: author.login,
      id: faker.number.int({ min: 1000, max: 999999 }),
      node_id: faker.string.alphanumeric(12),
      avatar_url: author.avatar,
      gravatar_id: "",
      url: faker.internet.url(),
      html_url: faker.internet.url(),
      followers_url: faker.internet.url(),
      following_url: faker.internet.url(),
      gists_url: faker.internet.url(),
      starred_url: faker.internet.url(),
      subscriptions_url: faker.internet.url(),
      organizations_url: faker.internet.url(),
      repos_url: faker.internet.url(),
      events_url: faker.internet.url(),
      received_events_url: faker.internet.url(),
      type: "User",
      user_view_type: "public",
      site_admin: false,
    },
    committer: {
      login: author.login,
      id: faker.number.int({ min: 1000, max: 999999 }),
      node_id: faker.string.alphanumeric(12),
      avatar_url: author.avatar,
      gravatar_id: "",
      url: faker.internet.url(),
      html_url: faker.internet.url(),
      followers_url: faker.internet.url(),
      following_url: faker.internet.url(),
      gists_url: faker.internet.url(),
      starred_url: faker.internet.url(),
      subscriptions_url: faker.internet.url(),
      organizations_url: faker.internet.url(),
      repos_url: faker.internet.url(),
      events_url: faker.internet.url(),
      received_events_url: faker.internet.url(),
      type: "User",
      user_view_type: "public",
      site_admin: false,
    },
    parents: [
      { sha: faker.string.alphanumeric(40), url: faker.internet.url(), html_url: faker.internet.url() },
    ],
  };
};

// Generador individual de PR
const generatePullRequest = (period = 'lastMonth') => {
  const author = pickAuthor();
  const createdAt = generateDateForPeriod(period);
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() }).toISOString();

  return {
    id: faker.number.int({ min: 1000, max: 999999 }),
    number: faker.number.int({ min: 1, max: 500 }),
    state: faker.helpers.arrayElement(['open', 'closed', 'merged']),
    title: faker.hacker.phrase(),
    body: faker.lorem.sentences(),
    user: {
      login: author.login,
      id: faker.number.int({ min: 1000, max: 999999 }),
      avatar_url: author.avatar,
      html_url: faker.internet.url(),
    },
    created_at: createdAt,
    updated_at: updatedAt,
    closed_at: faker.datatype.boolean() ? updatedAt : null,
    merged_at: faker.datatype.boolean() ? updatedAt : null,
    html_url: faker.internet.url(),
    base: { ref: faker.helpers.arrayElement(['main','develop','feature/mock']) },
    head: { ref: faker.helpers.arrayElement(['feature/mock','rama1','rama2']) },
  };
};

// Modificar generateMockStats para incluir PRs
export const generateMockStats = (n = 100, period = 'lastMonth') => {
  const commits = Array.from({ length: n }, () => generateCommit(period));
  const pullRequests = Array.from({ length: Math.floor(n / 5) }, () => generatePullRequest(period)); // ej. 1 PR cada 5 commits
  return { commitsCount: commits.length, commits, pullRequests };
};

// // Generador principal de stats
// export const generateMockStats = (n = 100, period = 'lastMonth') => {
//   const commits = Array.from({ length: n }, () => generateCommit(period));
//   return { commitsCount: commits.length, commits };
// };

// Generador de ramas mock
export const generateMockBranches = (
  branchNames = [
    "main","develop","feature/mock","rama1","rama2","rama3","rama4",
    "rama5","rama6","rama7","rama8","rama9","release","hotfix"
  ],
  period = 'lastMonth'
) => {
  return branchNames.map(name => ({
    name,
    stats: generateMockStats(faker.number.int({ min: 30, max: 120 }), period),
  }));
};
