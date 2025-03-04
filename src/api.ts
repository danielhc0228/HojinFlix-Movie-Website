const API_KEY = "10923b261ba94d897ac6b81148314a3f";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
    id: number;
    backdrop_path: string;
    poster_path: string;
    title: string;
    overview: string;
    release_date: string;
    vote_average: number;
}

export interface IGetMoviesResult {
    dates: {
        maximum: string;
        minimum: string;
    };
    page: number;
    results: IMovie[];
    total_pages: number;
    total_results: number;
}

export function getNowPlayingMovies() {
    return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
        (res) => res.json()
    );
}

export function getPopularMovies() {
    return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`).then((res) =>
        res.json()
    );
}

export function getTopRatedMovies() {
    return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
        (res) => res.json()
    );
}

export function getUpcomingMovies() {
    return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then((res) =>
        res.json()
    );
}

export function getDetailed(movieId: string) {
    return fetch(`${BASE_PATH}/movie/${movieId}?api_key=${API_KEY}`).then(
        (res) => res.json()
    );
}

export function getTrailer(movieId: string) {
    return fetch(
        `${BASE_PATH}/movie/${movieId}/videos?api_key=${API_KEY}`
    ).then((res) => res.json());
}
