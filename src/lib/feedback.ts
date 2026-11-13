import { Octokit } from 'octokit';

let instance: Octokit | undefined;

async function getOctokit(): Promise<Octokit> {
  if (instance) return instance;

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'Feedback requires the GITHUB_TOKEN environment variable (PAT with Discussions write access)',
    );
  }

  instance = new Octokit({ auth: token });
  return instance;
}

function gitOwner() {
  return 'CNCEB';
}

function gitRepo() {
  return 'website-docs';
}

const DiscussionCategory = 'Docs Feedback';

interface FeedbackInput {
  opinion: 'good' | 'bad';
  url: string;
  message: string;
}

export async function createDiscussion(input: FeedbackInput): Promise<string> {
  const octokit = await getOctokit();
  const owner = gitOwner();
  const repo = gitRepo();

  // find the repository discussion category id
  const {
    repository: { discussionCategories },
  } = await octokit.graphql<{
    repository: { discussionCategories: { nodes: { id: string; name: string }[] } };
  }>(
    `query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        discussionCategories(first: 10) {
          nodes { id name }
        }
      }
    }`,
    { owner, repo },
  );

  const category = discussionCategories.nodes.find(
    (node) => node.name === DiscussionCategory,
  );
  if (!category) {
    throw new Error(`Discussion category "${DiscussionCategory}" not found`);
  }

  const title = `Feedback: ${input.url}`;
  const body = [
    `Page: ${input.url}`,
    `Opinion: ${input.opinion === 'good' ? '有帮助 👍' : '需改进 👎'}`,
    input.message ? `\n---\n\n${input.message}` : '',
  ]
    .join('\n')
    .trim();

  // reuse an existing discussion with the same title, append a comment
  const search = await octokit.graphql<{
    search: { nodes: { id: string }[] };
  }>(
    `query ($query: String!) {
      search(type: DISCUSSION, query: $query, first: 1) {
        nodes { ... on Discussion { id } }
      }
    }`,
    { query: `repo:${owner}/${repo} in:title "${title}"` },
  );

  const existing = search.search.nodes[0];
  if (existing) {
    await octokit.graphql(
      `mutation ($id: ID!, $body: String!) {
        addDiscussionComment(input: { discussionId: $id, body: $body }) {
          comment { id }
        }
      }`,
      { id: existing.id, body },
    );
    return existing.id;
  }

  const {
    createDiscussion: { discussion },
  } = await octokit.graphql<{
    createDiscussion: { discussion: { id: string; url: string } };
  }>(
    `mutation ($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: { repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body }) {
        discussion { id url }
      }
    }`,
    { repoId: await getRepoId(octokit, owner, repo), categoryId: category.id, title, body },
  );

  return discussion.url;
}

async function getRepoId(octokit: Octokit, owner: string, repo: string): Promise<string> {
  const { repository } = await octokit.graphql<{ repository: { id: string } }>(
    `query ($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) { id }
    }`,
    { owner, repo },
  );
  return repository.id;
}
