import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Profile from './components/Profile';
import NoteState from './context/notes/NoteState';
import AuthState from './context/auth/AuthState';
import Signup from './components/Signup';
import Login from './components/Login';
import Trash from './components/Trash';
import Favorites from './components/Favorites';
import SwipeUpIcon from './components/SwipeUpIcon';
import Subscription from './components/Subscription';
import Payment from './components/Payment';
import MyFiles from './components/MyFiles';

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/signup', '/subscription/payment'];
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
                        <Route exact path="/subscription" element={<Subscription />} />
                        <Route exact path="/subscription/payment" element={<Payment />} />
                        <Route exact path="/files" element={<MyFiles />} />
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
            <AuthState>
                <NoteState>
                    <Router>
                        <AppLayout />
                    </Router>
                </NoteState>
            </AuthState>
        </>
    )
}

export default App;
