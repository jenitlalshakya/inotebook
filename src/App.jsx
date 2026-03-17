import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Profile from './components/Profile';
import NoteState from './context/notes/NoteState';
import Signup from './components/Signup';
import Login from './components/Login';
import Trash from './components/Trash';
import Favorites from './components/Favorites';
import SwipeUpIcon from './components/SwipeUpIcon';

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/signup'];
    const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

    return (
        <div className="app-layout">
            {!shouldHideNavbar && <Navbar />}
            <main className="app-main">
                <div className="container">
                    <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route exact path="/about" element={<About />} />
                        <Route exact path="/profile" element={<Profile />} />
                        <Route exact path="/login" element={<Login />} />
                        <Route exact path="/signup" element={<Signup />} />
                        <Route exact path="/trash" element={<Trash />} />
                        <Route exact path="/favorites" element={<Favorites />} />
                    </Routes>
                    <SwipeUpIcon />
                </div>
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <>
            <NoteState>
                <Router>
                    <AppLayout />
                </Router>
            </NoteState>
        </>
    )
}

export default App;
