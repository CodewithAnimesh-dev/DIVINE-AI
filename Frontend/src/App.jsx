import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from "react";
import { v1 as uuidv1 } from "uuid";

function App() {

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState(null);

    const [currThreadId, setCurrThreadId] = useState(uuidv1());

    const [prevChats, setPrevChats] = useState([]);

    const [newChat, setNewChat] = useState(true);

    const [allThreads, setAllThreads] = useState([]);

    // =========================
    // AUTHENTICATION
    // =========================

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // =========================
    // LOGIN / REGISTER PAGE
    // =========================

    const [showRegister, setShowRegister] = useState(false);

    // =========================
    // THEME
    // =========================

    const [darkMode, setDarkMode] = useState(true);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    // =========================
    // CHECK LOGIN
    // =========================

    useEffect(() => {

        const checkUser = async () => {

            try {

                const response = await fetch(
                    "http://localhost:8080/api/auth/me",
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {

                    const data = await response.json();

                    setUser(data.user);

                } else {

                    setUser(null);

                }

            } catch (error) {

                console.log("Authentication check error:", error);

                setUser(null);

            } finally {

                setAuthLoading(false);

            }

        };

        checkUser();

    }, []);

    // =========================
    // LOGIN SUCCESS
    // =========================

    const handleLoginSuccess = (loggedInUser) => {

        setUser(loggedInUser);

        setShowRegister(false);

        setAllThreads([]);

        setPrevChats([]);

        setReply(null);

        setPrompt("");

        setNewChat(true);

        setCurrThreadId(uuidv1());

    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = async () => {

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            const data = await response.json();

            console.log(data);

        } catch (error) {

            console.log("Logout error:", error);

        }

        // Clear frontend authentication state
        setUser(null);

        // Clear chat data
        setAllThreads([]);

        setPrevChats([]);

        setReply(null);

        setPrompt("");

        setNewChat(true);

        setCurrThreadId(uuidv1());

        // Show login page
        setShowRegister(false);

    };

    // =========================
    // CONTEXT
    // =========================

    const providerValues = {

        prompt,
        setPrompt,

        reply,
        setReply,

        currThreadId,
        setCurrThreadId,

        newChat,
        setNewChat,

        prevChats,
        setPrevChats,

        allThreads,
        setAllThreads,

        darkMode,
        setDarkMode,
        toggleTheme,

        // Authentication
        user,
        setUser,

        handleLoginSuccess,
        handleLogout

    };

    // =========================
    // AUTH LOADING
    // =========================

    if (authLoading) {

        return (
            <div className="authLoading">
                Loading Divine...
            </div>
        );

    }

    // =========================
    // LOGGED OUT
    // =========================

    if (!user) {

        return (

            <MyContext.Provider value={providerValues}>

                {showRegister ? (

                    <Register
                        onRegisterSuccess={() =>
                            setShowRegister(false)
                        }
                        onLoginClick={() =>
                            setShowRegister(false)
                        }
                    />

                ) : (

                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onRegisterClick={() =>
                            setShowRegister(true)
                        }
                    />

                )}

            </MyContext.Provider>

        );

    }

    // =========================
    // LOGGED IN
    // =========================

    return (

        <MyContext.Provider value={providerValues}>

            <div className={`app ${darkMode ? "dark" : "light"}`}>

                <Sidebar />

                <ChatWindow />

            </div>

        </MyContext.Provider>

    );

}

export default App;