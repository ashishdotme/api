import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { Octokit } from "https://esm.sh/octokit?dts";

const automatedRepos = ["api", "data.ashish.me", "status.ashish.me", "pake"];

const getLastCommitDetails = async (octokit: any, name: string): Promise<string | null> => {
  const commit = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: "ashishdotme",
    repo: name,
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!commit?.data) {
    return null;
  }

  const commitDetails = commit.data.find((x: any) => x.commit.committer.email === "ashishsushilpatel@gmail.com");
  return commitDetails?.commit?.committer?.date || null;
};

const getLastCommit = async (octokit: any): Promise<string | null> => {
  const response = await octokit.request("GET /user/repos", {
    sort: "pushed",
    visibility: "all",
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const filteredRepos = response.data.filter((x: any) => !automatedRepos.includes(x.name));

  let lastCommitDate = null;
  for (let i = 0; i < filteredRepos.length; i++) {
    lastCommitDate = getLastCommitDetails(octokit, filteredRepos[i].name);

    if (lastCommitDate) {
      return lastCommitDate;
    }
  }

  return null;
};

const getRecentPublicRepos = async (octokit: any): Promise<{ name: string; createdAt: string }[]> => {
  const response = await octokit.request("GET /user/repos", {
    sort: "pushed",
    visibility: "public",
    per_page: 20,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const filteredRepos = response.data.filter((x: any) => !automatedRepos.includes(x.name));

  return filteredRepos.map((x: any) => ({
    name: x.name,
    createdAt: x.created_at,
  }));
};

const fetchData = async (baseUrl: string, type: string): Promise<any[]> => {
  console.log(`Fetching ${type}`);
  const res = await fetch(baseUrl, { method: "GET" });
  return await res.json();
};

const fetchMovies = async (): Promise<any[]> => fetchData("https://api.ashish.me/movies", "movies");
const fetchShows = async (): Promise<any[]> => fetchData("https://api.ashish.me/shows", "shows");
const fetchBooks = async (): Promise<any[]> => fetchData("https://api.ashish.me/books", "books");
const fetchCourses = async (): Promise<any[]> => fetchData("https://api.ashish.me/courses", "courses");

const fetchGithub = async (): Promise<{ lastCommit: string | null; recentRepos: { name: string; createdAt: string }[] }> => {
  const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
  const lastCommit = await getLastCommit(octokit);
  const recentRepos = await getRecentPublicRepos(octokit);
  return { lastCommit, recentRepos };
};

await ensureDir("movies");
await ensureDir("shows");
await ensureDir("books");
await ensureDir("courses");
await ensureDir("github");

const github = await fetchGithub();
await Deno.writeTextFile("github/all.json", JSON.stringify(github, null, 2) + "\n");

const movies = await fetchMovies();
await Deno.writeTextFile("movies/all.json", JSON.stringify(movies, null, 2) + "\n");

const shows = await fetchShows();
await Deno.writeTextFile("shows/all.json", JSON.stringify(shows, null, 2) + "\n");

const books = await fetchBooks();
await Deno.writeTextFile("books/all.json", JSON.stringify(books, null, 2) + "\n");

const courses = await fetchCourses();
await Deno.writeTextFile("courses/all.json", JSON.stringify(courses, null, 2) + "\n");

Deno.exit(0);

export {};
