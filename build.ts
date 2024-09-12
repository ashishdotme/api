import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";


const fetchMovies = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/movies";

  console.log("Fetching movies");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json
};

const fetchShows = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/shows";

  console.log("Fetching Shows");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json
};

const fetchBooks = async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/books";

  console.log("Fetching movies");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json
};

const fetchCourses= async (): Promise<any[]> => {
  const baseUrl = "https://api.ashish.me/courses";

  console.log("Fetching courses");
  const res = await fetch(`${baseUrl}`, {
    method: "GET",
  });

  const json = await res.json();
  return json
};

await ensureDir("movies");
await ensureDir("shows");
await ensureDir("books");
await ensureDir("courses");

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
