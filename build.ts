import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { Octokit, App } from "https://esm.sh/octokit?dts";

const getLastCommit = async (octokit) => {
  return await octokit
    .request("GET /users/{username}/events", {
      username: "ashishdotme",
      per_page: 100,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    })
    .then((events) => {
      let lastCommit;
      events.data.some((event) => {
        return (
          event.type === "PushEvent" &&
          event.payload.commits.reverse().some((commit) => {
            if (commit.author.email === "ashishsushilpatel@gmail.com") {
              lastCommit = {
                repo: event.repo.name,
                sha: commit.sha,
                time: event.created_at,
                message: commit.message,
                url: commit.url,
              };

              return true;
            }

            return false;
          })
        );
      });

      return lastCommit;
    });
};

const getRecentRepos = async (octokit) => {
  const response = await octokit.request("GET /user/repos", {
    sort: "created",
    visibility: "public",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const repos = response.data.map((x) => ({
    name: x.name,
    createdAt: x.created_at,
    isPrivate: x.private,
  }));
  return repos;
};

const fetchMovies = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/movies";

  console.log("Fetching movies");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json;
};

const fetchShows = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/shows";

  console.log("Fetching Shows");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json;
};

const fetchBooks = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/books";

  console.log("Fetching movies");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json;
};

const fetchCourses = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/courses";

  console.log("Fetching courses");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json;
};

const fetchGithub = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/github";
  const octokit = new Octokit({
    auth: Deno.env.get("GITHUB_TOKEN"),
  });

  const lastCommit = await getLastCommit(octokit);
  const recentRepos = await getRecentRepos(octokit);
  return { lastCommit, recentRepos };
};

await ensureDir("movies");
await ensureDir("shows");
await ensureDir("books");
await ensureDir("courses");
await ensureDir("github");

const github = await fetchGithub();

await Deno.writeTextFile(
  "github/all.json",
  JSON.stringify(github, null, 2) + "\n"
);

const movies = await fetchMovies();

await Deno.writeTextFile(
  "movies/all.json",
  JSON.stringify(movies, null, 2) + "\n"
);

const shows = await fetchShows();

await Deno.writeTextFile(
  "shows/all.json",
  JSON.stringify(shows, null, 2) + "\n"
);

const books = await fetchBooks();

await Deno.writeTextFile(
  "books/all.json",
  JSON.stringify(books, null, 2) + "\n"
);

const courses = await fetchCourses();

await Deno.writeTextFile(
  "courses/all.json",
  JSON.stringify(courses, null, 2) + "\n"
);

export {};
