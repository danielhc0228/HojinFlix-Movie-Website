import { useLocation, useNavigate } from "react-router-dom";
import {
    getDetailed,
    getDetailedTV,
    getSearchMovie,
    getSearchTV,
    getTrailer,
    getTrailerTV,
    IGetMoviesResult,
    IGetTVResult,
} from "../api";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { Star, StarHalf } from "lucide-react";
import {
    AnimatePresence,
    motion,
    useScroll,
    useTransform,
} from "framer-motion";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #111;
    min-height: 100vh;
    color: white;
`;

const Section = styled.div`
    width: 100%;
    max-width: 1200px;
    margin-top: 80px; /* Push section down to avoid overlapping header */
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: left; /* Align to left */
    margin-left: 10px; /* Add space from left */
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(
        auto-fit,
        minmax(120px, 1fr)
    ); /* Responsive grid */
    gap: 10px;
    justify-content: center;
`;

const Card = styled(motion.div)`
    width: 120px;
    height: 180px;
    background-color: #222;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    text-align: center;
    font-weight: bold;
    color: white;
    box-shadow: 0px 3px 8px rgba(255, 255, 255, 0.1);

    &:hover {
        transform: scale(1.05);
        box-shadow: 0px 4px 12px rgba(255, 255, 255, 0.2);
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }
`;

const LoadMoreButton = styled.button`
    background-color: #e51013;
    color: white;
    font-size: 16px;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #c10f12;
    }
`;

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    z-index: 3;
`;
const Bigtv = styled(motion.div)`
    position: absolute;
    width: 53vw;
    height: 85vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-radius: 15px;
    overflow: hidden;
    background-color: ${(props) => props.theme.black.lighter};
    z-index: 3;
`;

const BigCover = styled.div`
    width: 100%;
    background-size: cover;
    background-position: center center;
    height: 250px;
`;
const BigTitle = styled.h3`
    color: ${(props) => props.theme.white.lighter};
    padding: 20px;
    font-size: 46px;
    position: relative;
    top: -80px;
`;
const BigOverview = styled.p`
    padding: 20px;
    position: relative;
    top: -80px;
    color: ${(props) => props.theme.white.lighter};
`;

const SemiHeader = styled.h3`
    color: ${(props) => props.theme.white.lighter};
    font-size: 17px;
    margin-left: 20px;
    position: relative;
    top: -80px;
    display: flex;
`;

interface IGenre {
    id: number;
    name: string;
}

interface ITVDetails {
    genres: IGenre[];
    number_of_episodes: number;
    number_of_seasons: number;
}

interface IMovieDetails {
    genres: IGenre[];
    runtime: number; // assuming runtime is a number (in minutes)
    // other fields that might come from the API
}

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const keyword = new URLSearchParams(location.search).get("keyword");
    const [data, setData] = useState<IGetMoviesResult["results"]>([]);
    const [tvData, setTVData] = useState<IGetTVResult["results"]>([]);
    const [page, setPage] = useState(1);
    const [hasMoreMovie, setHasMoreMovie] = useState(false);
    const [hasMoreTV, setHasMoreTV] = useState(false);

    const { scrollY } = useScroll();
    const setScrollY = useTransform(scrollY, (value) => value + 80);

    const onOverlayClick = () => {
        searchParams.delete("id");
        searchParams.delete("type");
        navigate(`/search?${searchParams.toString()}`);
    };

    const searchParams = new URLSearchParams(location.search);
    const selectedId = searchParams.get("id");
    const selectedType = searchParams.get("type");

    const clickedMovie =
        selectedType === "movie"
            ? data.find((movie) => movie.id === Number(selectedId))
            : null;

    const clickedTV =
        selectedType === "tv"
            ? tvData.find((tv) => tv.id === Number(selectedId))
            : null;

    const onBoxClicked = (id: number, type: "movie" | "tv") => {
        navigate(`/search?keyword=${keyword}&id=${id}&type=${type}`);
    };

    const getYear = (date: string) => {
        if (date) {
            return date.split("-")[0];
        } else {
            return "";
        }
    };

    const StarRating = ({ value }: { value: number }) => {
        const stars = 5;
        const rating = (value / 10) * stars; // Convert to 5-star scale
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div>
                {[...Array(stars)].map((_, index) => (
                    <span key={index}>
                        {index < fullStars ? (
                            <Star
                                width='20'
                                fill='currentColor'
                                stroke='none'
                            />
                        ) : index === fullStars && hasHalfStar ? (
                            <StarHalf
                                width='20'
                                fill='currentColor'
                                stroke='none'
                            />
                        ) : (
                            <Star width='20' />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    const [dataDetails, setDataDetails] = useState<IMovieDetails | null>(null);
    const [tvDetails, setTVDetails] = useState<ITVDetails | null>(null);

    const [trailerKey, setTrailerKey] = useState<string | null>(null);

    // Fetch additional details for the selected data
    useEffect(() => {
        console.log("Clicked data:", clickedMovie);

        if (clickedMovie && "id" in clickedMovie) {
            getDetailed(clickedMovie.id.toString()).then((data) => {
                setDataDetails(data);
            });

            getTrailer(clickedMovie.id.toString()).then((data) => {
                const trailer = data.results.find(
                    (video: { type: string; site: string }) =>
                        video.type === "Trailer" && video.site === "YouTube"
                );
                setTrailerKey(trailer ? trailer.key : null);
            });
        }
    }, [clickedMovie]);

    useEffect(() => {
        console.log("Clicked tv:", clickedTV);

        if (clickedTV && "id" in clickedTV) {
            getDetailedTV(clickedTV.id.toString()).then((data) => {
                setTVDetails(data);
            });

            getTrailerTV(clickedTV.id.toString()).then((data) => {
                const trailer = data.results.find(
                    (video: { type: string; site: string }) =>
                        video.type === "Trailer" && video.site === "YouTube"
                );
                setTrailerKey(trailer ? trailer.key : null);
            });
        }
    }, [clickedTV]);

    useEffect(() => {
        if (keyword !== null) {
            getSearchMovie(keyword, 1).then((data) => {
                setData(data.results);
                setHasMoreMovie(data.total_pages > 1); // If there are more pages, enable Load More button
            });
            getSearchTV(keyword, 1).then((data) => {
                setTVData(data.results);
                setHasMoreTV(data.total_pages > 1); // If there are more pages, enable Load More button
            });
        }
    }, [keyword]);

    const loadMoreMovie = () => {
        const nextPage = page + 1;
        setPage(nextPage);

        getSearchMovie(keyword!, nextPage).then((data) => {
            setData((prevMovies) => [...prevMovies, ...data.results]); // Append new results
            setHasMoreMovie(nextPage < data.total_pages); // Disable Load More if last page reached
        });
    };

    const loadMoreTV = () => {
        const nextPage = page + 1;
        setPage(nextPage);

        getSearchTV(keyword!, nextPage).then((data) => {
            setTVData((prevMovies) => [...prevMovies, ...data.results]); // Append new results
            setHasMoreTV(nextPage < data.total_pages); // Disable Load More if last page reached
        });
    };

    return (
        <Wrapper>
            {data ? (
                <>
                    {/* Movies Section */}
                    <Section>
                        <SectionTitle>Movies</SectionTitle>
                        <Grid>
                            {data.map(
                                (movie) =>
                                    movie.poster_path !== null && (
                                        <Card
                                            key={movie.id}
                                            layoutId={`movie-${movie.id}`}
                                            onClick={() =>
                                                onBoxClicked(movie.id, "movie")
                                            }
                                        >
                                            <img
                                                src={makeImagePath(
                                                    movie.poster_path,
                                                    "w300"
                                                )}
                                                alt={movie.title}
                                            />
                                        </Card>
                                    )
                            )}
                        </Grid>
                        {hasMoreMovie && (
                            <LoadMoreButton onClick={loadMoreMovie}>
                                Load More
                            </LoadMoreButton>
                        )}
                    </Section>

                    {/* TV Shows Section (If Applicable) */}
                    {tvData && (
                        <Section>
                            <SectionTitle>TV Shows</SectionTitle>
                            <Grid>
                                {tvData.map(
                                    (tv) =>
                                        tv.poster_path !== null && (
                                            <Card
                                                key={tv.id}
                                                layoutId={`tv-${tv.id}`}
                                                onClick={() =>
                                                    onBoxClicked(tv.id, "tv")
                                                }
                                            >
                                                <img
                                                    src={makeImagePath(
                                                        tv.poster_path,
                                                        "w300"
                                                    )}
                                                    alt={tv.name}
                                                />
                                            </Card>
                                        )
                                )}
                            </Grid>
                            {hasMoreTV && (
                                <LoadMoreButton onClick={loadMoreTV}>
                                    Load More
                                </LoadMoreButton>
                            )}
                        </Section>
                    )}
                </>
            ) : (
                <p style={{ color: "white" }}>No results found.</p>
            )}
            <AnimatePresence>
                {selectedId && (
                    <>
                        <Overlay
                            onClick={onOverlayClick}
                            exit={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />

                        <Bigtv
                            style={{ top: setScrollY }}
                            layoutId={
                                selectedType === "movie"
                                    ? `movie-${selectedId}`
                                    : `tv-${selectedId}`
                            }
                        >
                            {clickedMovie && (
                                <>
                                    {trailerKey ? (
                                        <iframe
                                            width='100%'
                                            height='400px'
                                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1`}
                                            title='Movie Trailer'
                                            allow='autoplay; encrypted-media'
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <BigCover
                                            style={{
                                                backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                                                    clickedMovie.backdrop_path,
                                                    "w500"
                                                )})`,
                                            }}
                                        />
                                    )}

                                    <BigTitle>{clickedMovie.title}</BigTitle>
                                    <SemiHeader>
                                        {getYear(clickedMovie.release_date)}
                                        {" | "}
                                        <StarRating
                                            value={clickedMovie.vote_average}
                                        />
                                        {" | "}
                                        {clickedMovie.vote_average.toFixed(1)}
                                        {" | "}
                                        {dataDetails?.runtime} min
                                        {" | "}
                                        {dataDetails?.genres
                                            .map((genre) => genre.name)
                                            .join(" • ")}
                                    </SemiHeader>
                                    <BigOverview>
                                        {clickedMovie.overview}
                                    </BigOverview>
                                </>
                            )}

                            {clickedTV && (
                                <>
                                    {trailerKey ? (
                                        <iframe
                                            width='100%'
                                            height='400px'
                                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1`}
                                            title='TV Trailer'
                                            allow='autoplay; encrypted-media'
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <BigCover
                                            style={{
                                                backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                                                    clickedTV.backdrop_path,
                                                    "w500"
                                                )})`,
                                            }}
                                        />
                                    )}

                                    <BigTitle>{clickedTV.name}</BigTitle>
                                    <SemiHeader>
                                        {getYear(clickedTV.first_air_date)}
                                        {" | "}
                                        <StarRating
                                            value={clickedTV.vote_average}
                                        />
                                        {" | "}
                                        {clickedTV.vote_average.toFixed(1)}
                                        {" | "}
                                        {tvDetails?.number_of_seasons} seasons
                                        {" | "}
                                        {tvDetails?.number_of_episodes} episodes
                                        {" | "}
                                        {tvDetails?.genres
                                            .map((genre) => genre.name)
                                            .join(" • ")}
                                    </SemiHeader>
                                    <BigOverview>
                                        {clickedTV.overview}
                                    </BigOverview>
                                </>
                            )}
                        </Bigtv>
                    </>
                )}
            </AnimatePresence>
        </Wrapper>
    );
}
export default Search;
