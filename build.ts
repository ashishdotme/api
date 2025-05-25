// deno-lint-ignore-file no-explicit-any
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { Octokit } from "https://esm.sh/octokit?dts";
import { formatDate, truncate } from "npm:@ashishdotme/utils@1.0.6"

const automatedRepos = ["api", "data.ashish.me", "status.ashish.me", "pake",  "ashishdotme"];
const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const getLastCommitDetails = async (name: string): Promise<string | null> => {
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

const getLastCommit = async (): Promise<string | null> => {
  const response = await octokit.request("GET /user/repos", {
    sort: "pushed",
    visibility: "all",
    per_page: 20,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const filteredRepos = response.data.filter((x: any) => !automatedRepos.includes(x.name));

  let lastCommitDate: string | null = null;
  for (let i = 0; i < filteredRepos.length; i++) {
    const commitDate = await getLastCommitDetails(filteredRepos[i].name);
    if (commitDate && (!lastCommitDate || new Date(commitDate) > new Date(lastCommitDate))) {
      lastCommitDate = commitDate;
    }
  }

  return lastCommitDate;
};

const getRecentPublicRepos = async (): Promise<{ name: string; pushedAt: string }[]> => {
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
    pushedAt: x.pushed_at,
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
const fetchListens = async (): Promise<any[]> => fetchData("https://api.ashish.me/listens", "listens");
const fetchSummary = async (): Promise<any[]> => fetchData("https://api.ashish.me/stats", "summary");

const fetchGithub = async (): Promise<{ lastCommit: string | null; recentRepos: { name: string; pushedAt: string }[] }> => {
  const lastCommit = await getLastCommit();
  const recentRepos = await getRecentPublicRepos();
  return { lastCommit, recentRepos };
};

const updateGistWithListens = async (json: any) => {
  let gist
  try {
    gist = await octokit.rest.gists.get({
     gist_id:"e31ad67b9c9a788f0f531955f7f823cc",
    })
    //gist = await octokit.request("GET /user/gists/e31ad67b9c9a788f0f531955f7f823cc"); 
  } catch (error: any) {
    console.error(
      `Failed to fetch gist: ${error.message}`
    )
  }
  const tracks = json.map((item: any) => ({
    name: item.title,
    date: item.listenDate
  }))
  if (!tracks.length) return

  const lines = []
  for (let index = 0; index < Math.min(tracks.length, 10); index++) {
    let { name, date } = tracks[index]
    name = truncate(name, 25)
    const line = [
      name,
      " - ",
      formatDate(date),
    ]
    lines.push(line.join(''))
  }

  try {
    const filename = Object.keys(gist?.data?.files)[0]
    await octokit.rest.gists.update({
      gist_id:"e31ad67b9c9a788f0f531955f7f823cc",
      files: {
        [filename]: {
          filename: '🎵 Listening ',
          content: lines.join('\n'),
        },
      },
    })
  } catch (error) {
    console.error(
      `Failed to update gist:\n${error}`
    )
  }
}

const updateGistWithMovies = async (json: any) => {
  let gist
  try {
    gist = await octokit.rest.gists.get({
     gist_id:"abc4f4782256d9df2cc0fe15c1264c4d",
    })
    //gist = await octokit.request("GET /user/gists/e31ad67b9c9a788f0f531955f7f823cc"); 
  } catch (error: any) {
    console.error(
      `Failed to fetch gist: ${error.message}`
    )
  }
  const tracks = json.map((item: any) => ({
    name: item.title,
    date: item.viewingDate
  }))
  if (!tracks.length) return

  const lines = []
  for (let index = 0; index < Math.min(tracks.length, 10); index++) {
    let { name, date } = tracks[index]
    name = truncate(name, 25)
    const line = [
      name,
      " - ",
      formatDate(date),
    ]
    lines.push(line.join(''))
  }

  try {
    const filename = Object.keys(gist?.data?.files)[0]
    await octokit.rest.gists.update({
      gist_id:"abc4f4782256d9df2cc0fe15c1264c4d",
      files: {
        [filename]: {
          filename: '🎬 Watching ',
          content: lines.join('\n'),
        },
      },
    })
  } catch (error) {
    console.error(
      `Failed to update gist:\n${error}`
    )
  }
}

await ensureDir("movies");
await ensureDir("shows");
await ensureDir("books");
await ensureDir("courses");
await ensureDir("github");
await ensureDir("summary");
await ensureDir("listens");

const github = await fetchGithub();
await Deno.writeTextFile("github/all.json", JSON.stringify(github, null, 2) + "\n");

const movies = await fetchMovies();
await Deno.writeTextFile("movies/all.json", JSON.stringify(movies, null, 2) + "\n");
await updateGistWithMovies(movies)

const shows = await fetchShows();
await Deno.writeTextFile("shows/all.json", JSON.stringify(shows, null, 2) + "\n");

const books = await fetchBooks();
await Deno.writeTextFile("books/all.json", JSON.stringify(books, null, 2) + "\n");

const courses = await fetchCourses();
await Deno.writeTextFile("courses/all.json", JSON.stringify(courses, null, 2) + "\n");

const listens = await fetchListens();
await Deno.writeTextFile("listens/all.json", JSON.stringify(listens, null, 2) + "\n");
await updateGistWithListens(listens)

const summary = await fetchSummary();
await Deno.writeTextFile("summary.json", JSON.stringify(summary, null, 2) + "\n");



Deno.exit(0);

export {};
