import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { makeImagePath } from "../utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IGetMoviesResult } from "../api";

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

const MovieSlider = ({
    title,
    movies,
    category,
}: {
    title: string;
    movies: IGetMoviesResult;
    category: string;
}) => {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [rowState, setRowState] = useState(1);

    const toggleLeaving = () => {
        setLeaving((prev) => !prev);
    };

    const onBoxClicked = (movieId: number) => {
        navigate(`/movies/${movieId}`);
    };
    const incraseIndex = () => {
        if (movies) {
            if (leaving) return;
            const totalMovies = movies.results.length;
            const maxIndex = Math.floor(totalMovies / offset) - 1;
            toggleLeaving();
            setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
            setRowState(1); // Moving forward
        }
    };

    const decraseIndex = () => {
        if (movies) {
            if (leaving) return;
            const totalMovies = movies.results.length;
            const maxIndex = Math.floor(totalMovies / offset) - 1;
            toggleLeaving();

            setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
            setRowState(-1); // Moving backward
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
        <Slider>
            <h2>{title}</h2>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                <SliderBtnLeft onClick={decraseIndex}>
                    <p>{"<"}</p>
                </SliderBtnLeft>
                <Row
                    key={`${category}-row-${index}`} // Add rowState to key to prevent animation issues
                    variants={getRowVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    custom={rowState}
                    transition={{ type: "tween", duration: 1.5 }}
                >
                    {movies?.results
                        .slice(1)
                        .slice(offset * index, offset * index + offset)
                        .map((movie) => (
                            <Box
                                layoutId={movie.id + ""}
                                initial='normal'
                                whileHover='hover'
                                onClick={() => onBoxClicked(movie.id)}
                                transition={{ type: "tween" }}
                                variants={boxVariants}
                                $bgPhoto={makeImagePath(
                                    movie.poster_path,
                                    "w500"
                                )}
                                key={`${category}-${index}-${movie.id}`}
                            >
                                <Info variants={infoVariants}>
                                    <h4>{movie.title}</h4>
                                </Info>
                            </Box>
                        ))}
                </Row>
                <SliderBtnRight onClick={incraseIndex}>
                    <p>{">"}</p>
                </SliderBtnRight>
            </AnimatePresence>
        </Slider>
    );
};

export default MovieSlider;
