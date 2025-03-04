import { useQuery } from "react-query";
import styled from "styled-components";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
} from "framer-motion";
import {
    getDetailedTV,
    getAirTodayShows,
    getOnTheAirShows,
    getPopularShows,
    getTopRatedShows,
    getTrailerTV,
} from "../api";
import { makeImagePath } from "../utils";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IGetTVResult } from "../api";
import { Star, StarHalf } from "lucide-react";

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
    font-size: 20px;
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
    width: 50px;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%; /* Makes it a circle */
    position: absolute;
    left: 10px; /* Adjust for positioning */
    top: 195px;
    transform: translateY(-50%);
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;

    &:hover {
        background-color: rgba(0, 0, 0, 0.8);
        transform: translateY(-50%) scale(1.1); /* Slight scale effect */
    }

    &:active {
        transform: translateY(-50%) scale(0.9); /* Shrinks when clicked */
    }
`;

const SliderBtnRight = styled(SliderBtnLeft)`
    right: 0;
    left: auto;
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

const Sliders = styled.div`
    display: flex;
    flex-direction: column;
    gap: 500px; /* Adjust spacing between sliders */
    padding: 20px 0; /* Optional: Add padding at the top and bottom */
`;

const BannerBtn = styled.button`
    width: 150px; /* Fixed width for consistency */
    height: 45px; /* Adjusted height for better appearance */
    margin-top: 20px;
    border-radius: 10px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.2); /* Semi-transparent button */
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: 2px solid rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px); /* Glassmorphism effect */
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &:hover {
        background-color: rgba(255, 255, 255, 0.4);
        border-color: white;
        opacity: 1;
        transform: scale(1.05);
    }

    &:active {
        transform: scale(0.95);
    }
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

interface IGenre {
    id: number;
    name: string;
}

interface ITVDetails {
    genres: IGenre[];
    number_of_episodes: number;
    number_of_seasons: number;
}

function Tv() {
    const navigate = useNavigate();
    const bigTVMatch: PathMatch<string> | null = useMatch("/tvs/:id");
    const { scrollY } = useScroll();
    const setScrollY = useTransform(scrollY, (value) => value + 80);
    const { data: airToday, isLoading: airTodayLoading } =
        useQuery<IGetTVResult>(["tvs", "airToday"], getAirTodayShows);
    const { data: popular, isLoading: popularLoading } = useQuery<IGetTVResult>(
        ["tvs", "popular"],
        getPopularShows
    );
    const { data: topRated, isLoading: topRatedLoading } =
        useQuery<IGetTVResult>(["tvs", "topRated"], getTopRatedShows);
    const { data: onTheAir, isLoading: onTheAirLoading } =
        useQuery<IGetTVResult>(["tvs", "onTheAir"], getOnTheAirShows);

    const onOverlayClick = () => navigate("/tvs");

    const allTVs = [
        ...(airToday?.results || []),
        ...(popular?.results || []),
        ...(topRated?.results || []),
        ...(onTheAir?.results || []),
    ];

    const clickedTV =
        bigTVMatch?.params.id &&
        allTVs.find((tv) => tv.id === +bigTVMatch.params.id!); //+ is to convert bigTVMatch.params.id to Number. You can do String(tv.id) or tv.id+""

    const [airTodayIndex, setAirTodayIndex] = useState(0);
    const [popularIndex, setPopularIndex] = useState(0);
    const [topRatedIndex, setTopRatedIndex] = useState(0);
    const [onTheAirIndex, setOnTheAirIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [rowStateAirToday, setRowStateAirToday] = useState(1);
    const [rowStatePopular, setRowStatePopular] = useState(1);
    const [rowStateTopRated, setRowStateTopRated] = useState(1);
    const [rowStateOnTheAir, setRowStateOnTheAir] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    const toggleLeaving = () => {
        setLeaving((prev) => !prev);
    };

    const onBoxClicked = (tvId: number, category: string) => {
        setSelectedCategory(category);
        navigate(`/tvs/${tvId}`);
    };
    const incraseIndex = (
        category: "airToday" | "popular" | "topRated" | "onTheAir"
    ) => {
        if (category) {
            if (leaving) return;

            const dataMap = {
                airToday: {
                    data: airToday,
                    setIndex: setAirTodayIndex,
                    setRowState: setRowStateAirToday,
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
                onTheAir: {
                    data: onTheAir,
                    setIndex: setOnTheAirIndex,
                    setRowState: setRowStateOnTheAir,
                },
            };

            const selectedData = dataMap[category];

            if (selectedData) {
                const totalTVs = selectedData.data?.results.length;
                const maxIndex = Math.floor(totalTVs! / offset) - 1;
                toggleLeaving();
                selectedData.setIndex((prev) =>
                    prev === maxIndex ? 0 : prev + 1
                );
                selectedData.setRowState(1);
            }
        }
    };

    const decreaseIndex = (
        category: "airToday" | "popular" | "topRated" | "onTheAir"
    ) => {
        if (category) {
            if (leaving) return;

            const dataMap = {
                airToday: {
                    data: airToday,
                    setIndex: setAirTodayIndex,
                    setRowState: setRowStateAirToday,
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
                onTheAir: {
                    data: onTheAir,
                    setIndex: setOnTheAirIndex,
                    setRowState: setRowStateOnTheAir,
                },
            };

            const selectedData = dataMap[category];

            if (selectedData) {
                const totalTVs = selectedData.data?.results.length;
                const maxIndex = Math.floor(totalTVs! / offset) - 1;
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

    const [tvDetails, setTVDetails] = useState<ITVDetails | null>(null);

    const [trailerKey, setTrailerKey] = useState<string | null>(null);

    // Fetch additional details for the selected tv
    useEffect(() => {
        console.log("Clicked TV:", clickedTV);

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

    return (
        <Wrapper>
            {airTodayLoading &&
            popularLoading &&
            topRatedLoading &&
            onTheAirLoading ? (
                <Loader>Loading...</Loader>
            ) : (
                <>
                    <Banner
                        $bgPhoto={makeImagePath(
                            airToday?.results[0].backdrop_path || ""
                        )}
                    >
                        <Title>{airToday?.results[0].name}</Title>
                        <Overview>{airToday?.results[0].overview}</Overview>
                        <BannerBtn
                            onClick={() => {
                                if (airToday?.results[0]?.id !== undefined) {
                                    onBoxClicked(
                                        airToday.results[0].id,
                                        "airToday"
                                    );
                                }
                            }}
                        >
                            More Info
                        </BannerBtn>
                    </Banner>
                    <Sliders>
                        <Slider>
                            <h2>Airing Today</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("airToday")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`airToday-${airTodayIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStateAirToday}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {airToday?.results
                                        .slice(1)
                                        .slice(
                                            offset * airTodayIndex,
                                            offset * airTodayIndex + offset
                                        )
                                        .map((tv) => (
                                            <Box
                                                layoutId={`airToday-${tv.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        tv.id,
                                                        "airToday"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    tv.poster_path,
                                                    "w500"
                                                )}
                                                key={`airToday-${tv.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{tv.name}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("airToday")}
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
                                        .map((tv) => (
                                            <Box
                                                layoutId={`popular-${tv.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        tv.id,
                                                        "popular"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    tv.poster_path,
                                                    "w500"
                                                )}
                                                key={`popular-${tv.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{tv.name}</h4>
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
                                        .map((tv) => (
                                            <Box
                                                layoutId={`topRated-${tv.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        tv.id,
                                                        "topRated"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    tv.poster_path,
                                                    "w500"
                                                )}
                                                key={`topRated-${tv.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{tv.name}</h4>
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
                            <h2>On The Air</h2>
                            <AnimatePresence
                                initial={false}
                                onExitComplete={toggleLeaving}
                            >
                                <SliderBtnLeft
                                    onClick={() => decreaseIndex("onTheAir")}
                                >
                                    <p>{"<"}</p>
                                </SliderBtnLeft>
                                <Row
                                    key={`onTheAir-${onTheAirIndex}`} // Add rowState to key to prevent animation issues
                                    variants={getRowVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                    custom={rowStateOnTheAir}
                                    transition={{
                                        type: "tween",
                                        duration: 1.5,
                                    }}
                                >
                                    {onTheAir?.results
                                        .slice(1)
                                        .slice(
                                            offset * onTheAirIndex,
                                            offset * onTheAirIndex + offset
                                        )
                                        .map((tv) => (
                                            <Box
                                                layoutId={`onTheAir-${tv.id}`}
                                                initial='normal'
                                                whileHover='hover'
                                                onClick={() =>
                                                    onBoxClicked(
                                                        tv.id,
                                                        "onTheAir"
                                                    )
                                                }
                                                transition={{ type: "tween" }}
                                                variants={boxVariants}
                                                $bgPhoto={makeImagePath(
                                                    tv.poster_path,
                                                    "w500"
                                                )}
                                                key={`onTheAir-${tv.id}`}
                                            >
                                                <Info variants={infoVariants}>
                                                    <h4>{tv.name}</h4>
                                                </Info>
                                            </Box>
                                        ))}
                                </Row>
                                <SliderBtnRight
                                    onClick={() => incraseIndex("onTheAir")}
                                >
                                    <p>{">"}</p>
                                </SliderBtnRight>
                            </AnimatePresence>
                        </Slider>
                    </Sliders>
                    <AnimatePresence>
                        {bigTVMatch ? (
                            <>
                                <Overlay
                                    onClick={onOverlayClick}
                                    exit={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                                <Bigtv
                                    style={{ top: setScrollY }}
                                    layoutId={`${selectedCategory}-${bigTVMatch.params.id}`}
                                >
                                    {clickedTV && (
                                        <>
                                            {trailerKey ? (
                                                <iframe
                                                    width='100%'
                                                    height='400px'
                                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1`}
                                                    title='tv Trailer'
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

                                            <BigTitle>
                                                {clickedTV.name}
                                            </BigTitle>
                                            <SemiHeader>
                                                {getYear(
                                                    clickedTV.first_air_date
                                                )}
                                                {"‎ "}
                                                {"   |   "}
                                                {"‎ "}
                                                <StarRating
                                                    value={
                                                        clickedTV.vote_average
                                                    }
                                                />
                                                {"‎ "}
                                                {clickedTV.vote_average.toFixed(
                                                    1
                                                )}
                                                {" ‎ | ‎ "}
                                                {
                                                    tvDetails?.number_of_seasons
                                                }{" "}
                                                seasons
                                                {" ‎ | ‎ "}
                                                {
                                                    tvDetails?.number_of_episodes
                                                }{" "}
                                                episodes
                                                {" ‎ | ‎ "}
                                                {tvDetails?.genres
                                                    .map(
                                                        (genre: {
                                                            name: string;
                                                        }) => genre.name
                                                    )
                                                    .join(" • ")}
                                            </SemiHeader>
                                            <BigOverview>
                                                {clickedTV.overview}
                                            </BigOverview>
                                        </>
                                    )}
                                </Bigtv>
                            </>
                        ) : null}
                    </AnimatePresence>
                </>
            )}
        </Wrapper>
    );
}
export default Tv;
