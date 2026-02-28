import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import NoteState from './context/notes/NoteState';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
    return (
        <>
            <NoteState>
                <Router>
                    <div className="app-layout">
                        <Navbar title="iNotebook" />
                        <main className="app-main">
                            <div className="container">
                                <Routes>
                                    <Route exact path="/" element={<Home />} />
                                    <Route exact path="/about" element={<About />} />
                                    <Route exact path="/login" element={<Login />} />
                                    <Route exact path="/signup" element={<Signup />} />
                                </Routes>
                            </div>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </NoteState>
        </>
    )
}

export default App;
