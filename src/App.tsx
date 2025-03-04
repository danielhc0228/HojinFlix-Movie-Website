import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";
import Footer from "./Components/Footer";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path='/tvs' element={<Tv />} />
                <Route path='/tvs/:id' element={<Tv />} />
                <Route path='/search' element={<Search />} />
                <Route path='/' element={<Home />} />
                <Route path='movies/:id' element={<Home />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
