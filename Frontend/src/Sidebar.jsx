import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import divineLogo from "./assets/DIVINE.png.jpeg";

function Sidebar() {

    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setCurrThreadId,
        setPrevChats
    } = useContext(MyContext);


    // =========================
    // GET ALL THREADS
    // =========================

    const getAllThreads = async () => {

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/thread`,
                {
                    // Send JWT cookie
                    credentials: "include"
                }
            );


            const res = await response.json();


            // User is not logged in
            if (response.status === 401) {

                setAllThreads([]);

                return;
            }


            if (!response.ok) {

                console.log(
                    res?.error ||
                    "Failed to fetch threads"
                );

                return;
            }


            const filteredData = res.map(thread => ({

                threadId: thread.threadId,

                title: thread.title

            }));


            setAllThreads(filteredData);

        } catch (err) {

            console.log(
                "Get threads error:",
                err
            );

        }

    };


    // =========================
    // LOAD THREADS
    // =========================

    useEffect(() => {

        getAllThreads();

    }, [currThreadId]);


    // =========================
    // CREATE NEW CHAT
    // =========================

    const createNewChat = () => {

        setNewChat(true);

        setPrompt("");

        setReply(null);

        setCurrThreadId(uuidv1());

        setPrevChats([]);

    };


    // =========================
    // CHANGE THREAD
    // =========================

    const changeThread = async (newThreadId) => {

        setCurrThreadId(newThreadId);

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/thread/${newThreadId}`,
                {
                    // Send JWT cookie
                    credentials: "include"
                }
            );


            const res = await response.json();


            if (!response.ok) {

                console.log(
                    res?.error ||
                    "Failed to load thread"
                );

                return;
            }


            console.log("Thread messages:", res);


            setPrevChats(res);

            setNewChat(false);

            setReply(null);

        } catch (err) {

            console.log(
                "Change thread error:",
                err
            );

        }

    };


    // =========================
    // DELETE THREAD
    // =========================

    const deleteThread = async (threadId) => {

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/thread/${threadId}`,
                {
                    method: "DELETE",

                    // Send JWT cookie
                    credentials: "include"
                }
            );


            const res = await response.json();


            console.log(
                "Delete response:",
                res
            );


            if (!response.ok) {

                console.log(
                    res?.error ||
                    "Failed to delete thread"
                );

                return;
            }


            // Remove deleted thread from sidebar
            setAllThreads(prev =>
                prev.filter(
                    thread =>
                        thread.threadId !== threadId
                )
            );


            // If current thread was deleted
            if (threadId === currThreadId) {

                createNewChat();

            }

        } catch (err) {

            console.log(
                "Delete thread error:",
                err
            );

        }

    };


    return (

        <section className="sidebar">


            {/* =========================
                NEW CHAT BUTTON
            ========================= */}

            <button onClick={createNewChat}>

                <img
                    src={divineLogo}
                    alt="Divine Logo"
                    className="logo"
                />

                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>

            </button>


            {/* =========================
                CHAT HISTORY
            ========================= */}

            <ul className="history">

                {allThreads?.map((thread) => (

                    <li
                        key={thread.threadId}

                        onClick={() =>
                            changeThread(thread.threadId)
                        }

                        className={
                            thread.threadId === currThreadId
                                ? "highlighted"
                                : ""
                        }
                    >

                        {thread.title}


                        {/* DELETE */}

                        <i
                            className="fa-solid fa-trash"

                            onClick={(e) => {

                                e.stopPropagation();

                                deleteThread(
                                    thread.threadId
                                );

                            }}
                        ></i>

                    </li>

                ))}

            </ul>


            {/* =========================
                SIGNATURE
            ========================= */}

            <div className="sign">

                <p>
                    By Animesh &hearts;
                </p>

            </div>

        </section>

    );

}

export default Sidebar;