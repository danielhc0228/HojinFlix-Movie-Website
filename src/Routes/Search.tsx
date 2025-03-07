import { useLocation } from "react-router-dom";
import {
    getSearchMovie,
    getSearchTV,
    IGetMoviesResult,
    IGetTVResult,
} from "../api";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { makeImagePath } from "../utils";

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

const Card = styled.div`
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

function Search() {
    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get("keyword");
    const [data, setData] = useState<IGetMoviesResult["results"]>([]);
    const [tvData, setTVData] = useState<IGetTVResult["results"]>([]);
    const [page, setPage] = useState(1);
    const [hasMoreMovie, setHasMoreMovie] = useState(false);
    const [hasMoreTV, setHasMoreTV] = useState(false);

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
                                        <Card key={movie.id}>
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
                                            <Card key={tv.id}>
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
        </Wrapper>
    );
}
export default Search;
