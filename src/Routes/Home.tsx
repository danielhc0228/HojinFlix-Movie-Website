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
import { PathMatch, useMatch, useNavigate } from "react-router-dom";
import { useState } from "react";
import { IGetMoviesResult } from "../api";

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

const offset = 6;

const Slider = styled.div`
    position: relative;
    top: -100px;
`;
const Row = styled(motion.div)`
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(6, 1fr);
    position: absolute;
    width: 100%;
    z-index: 1;
`;
const Box = styled(motion.div)<{ $bgPhoto: string }>`
    background-color: white;
    height: 350px;
    font-size: 66px;
    background-image: url(${(props) => props.$bgPhoto});
    background-size: cover;
    &:first-child {
        transform-origin: center left;
    }
    &:last-child {
        transform-origin: center right;
    }
`;

const Info = styled(motion.div)`
    padding: 10px;
    background-color: ${(props) => props.theme.black.lighter};
    opacity: 0;
    position: absolute;
    width: 100%;
    bottom: 0;
    z-index: 3;
    h4 {
        text-align: center;
        font-size: 18px;
    }
`;

const SliderBtnLeft = styled.div`
    margin: auto;
    background-color: rgba(0, 0, 0, 0.5);
    height: 350px;
    position: absolute;
    width: 5%;
    font-size: 50px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0;
    z-index: 2;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;

    &:hover {
        background-color: rgba(0, 0, 0, 0.8);
    }
`;

const SliderBtnRight = styled(SliderBtnLeft)`
    right: 0;
    left: auto;
`;

const boxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        scale: 1.3,
        y: -50,
        transition: {
            delay: 0.3,
            duaration: 0.1,
            type: "tween",
        },
    },
};

const infoVariants = {
    hover: {
        opacity: 1,
        transition: {
            delay: 0.3,
            duaration: 0.1,
            type: "tween",
        },
    },
};

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
    const bigMovieMatch: PathMatch<string> | null = useMatch("/movies/:id");
    const { scrollY } = useScroll();
    const setScrollY = useTransform(scrollY, (value) => value + 50);
    const { data: nowPlaying, isLoading: nowPlayingLoading } =
        useQuery<IGetMoviesResult>(
            ["movies", "nowPlaying"],
            getNowPlayingMovies
        );
    const { data: popular, isLoading: popularLoading } =
        useQuery<IGetMoviesResult>(["movies", "popular"], getPopularMovies);
    const { data: topRated, isLoading: topRatedLoading } =
        useQuery<IGetMoviesResult>(["movies", "topRated"], getTopRatedMovies);
    const { data: upcoming, isLoading: upcomingLoading } =
        useQuery<IGetMoviesResult>(["movies", "upcoming"], getUpcomingMovies);

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

    const [nowPlayingIndex, setNowPlayingIndex] = useState(0);
    const [popularIndex, setPopularIndex] = useState(0);
    const [topRatedIndex, setTopRatedIndex] = useState(0);
    const [upcomingIndex, setUpcomingIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [rowStateNowPlaying, setRowStateNowPlaying] = useState(1);
    const [rowStatePopular, setRowStatePopular] = useState(1);
    const [rowStateTopRated, setRowStateTopRated] = useState(1);
    const [rowStateUpcoming, setRowStateUpcoming] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    const toggleLeaving = () => {
        setLeaving((prev) => !prev);
    };

    const onBoxClicked = (movieId: number, category: string) => {
        setSelectedCategory(category);
        navigate(`/movies/${movieId}`);
    };
    const incraseIndex = (
        category: "nowPlaying" | "popular" | "topRated" | "upcoming"
    ) => {
        if (category) {
            if (leaving) return;

            const dataMap = {
                nowPlaying: {
                    data: nowPlaying,
                    setIndex: setNowPlayingIndex,
                    setRowState: setRowStateNowPlaying,
                },
                popular: {
                    data: popular,
                    setIndex: setPopularIndex,
                    setRowState: setRowStatePopular,
                },
                topRated: {
                    data: topRated,
                    setIndex: setTopRatedIndex,
                    setRowState: setRowStateTopRated,
                },
                upcoming: {
                    data: upcoming,
                    setIndex: setUpcomingIndex,
                    setRowState: setRowStateUpcoming,
                },
            };

            const selectedData = dataMap[category];

            if (selectedData) {
                const totalMovies = selectedData.data?.results.length;
                const maxIndex = Math.floor(totalMovies! / offset) - 1;
                toggleLeaving();
                selectedData.setIndex((prev) =>
                    prev === maxIndex ? 0 : prev + 1
                );
                selectedData.setRowState(1);
                // if (category === "nowPlaying") {
                //     setRowStateNowPlaying(1); // Moving forward
                // } else if (category === "popular") {
                //     setRowStatePopular(1); // Moving forward
                // } else if (category === "topRated") {
                //     setRowStateTopRated(1); // Moving forward
                // } else if (category === "upcoming") {
                //     setRowStateUpcoming(1); // Moving forward
                // }
            }
        }
    };

    const decreaseIndex = (
        category: "nowPlaying" | "popular" | "topRated" | "upcoming"
    ) => {
        if (category) {
            if (leaving) return;

            const dataMap = {
                nowPlaying: {
                    data: nowPlaying,
                    setIndex: setNowPlayingIndex,
                    setRowState: setRowStateNowPlaying,
                },
                popular: {
                    data: popular,
                    setIndex: setPopularIndex,
                    setRowState: setRowStatePopular,
                },
                topRated: {
                    data: topRated,
                    setIndex: setTopRatedIndex,
                    setRowState: setRowStateTopRated,
                },
                upcoming: {
                    data: upcoming,
                    setIndex: setUpcomingIndex,
                    setRowState: setRowStateUpcoming,
                },
            };

            const selectedData = dataMap[category];

            if (selectedData) {
                const totalMovies = selectedData.data?.results.length;
                const maxIndex = Math.floor(totalMovies! / offset) - 1;
                toggleLeaving();
                selectedData.setIndex((prev) =>
                    prev === 0 ? maxIndex : prev - 1
                );
                selectedData.setRowState(-1);
            }
        }
    };

    // Circular animation logic
    const getRowVariants = {
        hidden: (custom: number) => ({
            x: custom === 1 ? window.outerWidth - 5 : -window.outerWidth + 5,
        }),
        visible: {
            x: 0,
        },
        exit: (custom: number) => ({
            x: custom === 1 ? -window.outerWidth + 5 : window.outerWidth - 5,
        }),
    };

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
                        <Slider>
                            <h2>Now Playing</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("nowPlaying")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`nowPlaying-${nowPlayingIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStateNowPlaying}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {nowPlaying?.results
                                        .slice(1)
                                        .slice(
                                            offset * nowPlayingIndex,
                                            offset * nowPlayingIndex + offset
                                        )
                                        .map((movie) => (
                                            <Box
                                                layoutId={`nowPlaying-${movie.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        movie.id,
                                                        "nowPlaying"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    movie.poster_path,
                                                    "w500"
                                                )}
                                                key={`nowPlaying-${movie.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{movie.title}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("nowPlaying")}
                                >
                                    <p>{">"}</p>
                                </SliderBtnRight>
                            </AnimatePresence>
                        </Slider>
                        <Slider>
                            <h2>Popular</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("popular")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`popular-${popularIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStatePopular}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {popular?.results
                                        .slice(1)
                                        .slice(
                                            offset * popularIndex,
                                            offset * popularIndex + offset
                                        )
                                        .map((movie) => (
                                            <Box
                                                layoutId={`popular-${movie.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        movie.id,
                                                        "popular"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    movie.poster_path,
                                                    "w500"
                                                )}
                                                key={`popular-${movie.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{movie.title}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("popular")}
                                >
                                    <p>{">"}</p>
                                </SliderBtnRight>
                            </AnimatePresence>
                        </Slider>
                        <Slider>
                            <h2>Top Rated</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("topRated")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`topRated-${topRatedIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStateTopRated}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {topRated?.results
                                        .slice(1)
                                        .slice(
                                            offset * topRatedIndex,
                                            offset * topRatedIndex + offset
                                        )
                                        .map((movie) => (
                                            <Box
                                                layoutId={`topRated-${movie.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        movie.id,
                                                        "topRated"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    movie.poster_path,
                                                    "w500"
                                                )}
                                                key={`topRated-${movie.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{movie.title}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("topRated")}
                                >
                                    <p>{">"}</p>
                                </SliderBtnRight>
                            </AnimatePresence>
                        </Slider>
                        <Slider>
                            <h2>Upcoming</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("upcoming")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`upcoming-${upcomingIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStateUpcoming}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {upcoming?.results
                                        .slice(1)
                                        .slice(
                                            offset * upcomingIndex,
                                            offset * upcomingIndex + offset
                                        )
                                        .map((movie) => (
                                            <Box
                                                layoutId={`upcoming-${movie.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        movie.id,
                                                        "upcoming"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    movie.poster_path,
                                                    "w500"
                                                )}
                                                key={`upcoming-${movie.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{movie.title}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("upcoming")}
                                >
                                    <p>{">"}</p>
                                </SliderBtnRight>
                            </AnimatePresence>
                        </Slider>
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
                                    layoutId={`${selectedCategory}-${bigMovieMatch.params.id}`}
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
