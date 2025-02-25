import { useQuery } from "react-query";
import styled from "styled-components";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
} from "framer-motion";
import {
    getNowPlayingMovies,
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
} from "../api";
import { makeImagePath } from "../utils";
import MovieSlider from "../Components/MovieSlider";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
    background: black;
    padding-bottom: 200px;
`;
const Loader = styled.div`
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const Banner = styled.div<{ $bgPhoto: string }>`
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
        url(${(props) => props.$bgPhoto});
    background-size: cover;
`;
const Title = styled.h2`
    font-size: 60px;
    margin-bottom: 20px;
`;
const Overview = styled.p`
    font-size: 23px;
    width: 50%;
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
const BigMovie = styled(motion.div)`
    position: absolute;
    width: 40vw;
    height: 80vh;
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
    height: 400px;
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

const Sliders = styled.div`
    display: flex;
    flex-direction: column;
    gap: 500px; /* Adjust spacing between sliders */
    padding: 20px 0; /* Optional: Add padding at the top and bottom */
`;

function Home() {
    const navigate = useNavigate();
    // const bigMovieMatch = useMatch<{ movieId: string }>("/movies/:movieId");
    const bigMovieMatch: PathMatch<string> | null = useMatch("/movies/:id");
    const { scrollY } = useScroll();
    const setScrollY = useTransform(scrollY, (value) => value + 50);
    const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery(
        ["movies", "nowPlaying"],
        getNowPlayingMovies
    );
    const { data: popular, isLoading: popularLoading } = useQuery(
        ["movies", "popular"],
        getPopularMovies
    );
    const { data: topRated, isLoading: topRatedLoading } = useQuery(
        ["movies", "topRated"],
        getTopRatedMovies
    );
    const { data: upcoming, isLoading: upcomingLoading } = useQuery(
        ["movies", "upcoming"],
        getUpcomingMovies
    );

    const onOverlayClick = () => navigate("/");

    const allMovies = [
        ...(nowPlaying?.results || []),
        ...(popular?.results || []),
        ...(topRated?.results || []),
        ...(upcoming?.results || []),
    ];

    const clickedMovie =
        bigMovieMatch?.params.id &&
        allMovies.find((movie) => movie.id === +bigMovieMatch.params.id!); //+ is to convert bigMovieMatch.params.id to Number. You can do String(movie.id) or movie.id+""

    return (
        <Wrapper>
            {nowPlayingLoading &&
            popularLoading &&
            topRatedLoading &&
            upcomingLoading ? (
                <Loader>Loading...</Loader>
            ) : (
                <>
                    <Banner
                        $bgPhoto={makeImagePath(
                            nowPlaying?.results[0].backdrop_path || ""
                        )}
                    >
                        <Title>{nowPlaying?.results[0].title}</Title>
                        <Overview>{nowPlaying?.results[0].overview}</Overview>
                    </Banner>
                    <Sliders>
                        <MovieSlider
                            title='Now Playing'
                            movies={nowPlaying}
                            category='nowPlaying'
                        />
                        <MovieSlider
                            title='Popular'
                            movies={popular}
                            category='popular'
                        />
                        <MovieSlider
                            title='Top Rated'
                            movies={topRated}
                            category='topRated'
                        />
                        <MovieSlider
                            title='Upcoming'
                            movies={upcoming}
                            category='upcoming'
                        />
                    </Sliders>
                    <AnimatePresence>
                        {bigMovieMatch ? (
                            <>
                                <Overlay
                                    onClick={onOverlayClick}
                                    exit={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                                <BigMovie
                                    style={{ top: setScrollY }}
                                    layoutId={bigMovieMatch?.params?.id}
                                >
                                    {clickedMovie && (
                                        <>
                                            <BigCover
                                                style={{
                                                    backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                                                        clickedMovie.backdrop_path,
                                                        "w500"
                                                    )})`,
                                                }}
                                            />
                                            <BigTitle>
                                                {clickedMovie.title}
                                            </BigTitle>
                                            <BigOverview>
                                                {clickedMovie.overview}
                                            </BigOverview>
                                        </>
                                    )}
                                </BigMovie>
                            </>
                        ) : null}
                    </AnimatePresence>
                </>
            )}
        </Wrapper>
    );
}
export default Home;
