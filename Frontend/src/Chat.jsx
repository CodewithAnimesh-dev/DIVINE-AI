import "./Chat.css";
import { useContext, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {

    const {
        newChat,
        prevChats
    } = useContext(MyContext);

    const chatEndRef = useRef(null);


    // =========================
    // AUTO SCROLL
    // =========================

    useEffect(() => {

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [prevChats]);


    return (
        <>

            {/* NEW CHAT MESSAGE */}

            {newChat && (
                <h1>
                    What would you like to explore today?
                </h1>
            )}


            {/* CHAT AREA */}

            <div className="chats">

                {prevChats?.map((chat, idx) => (

                    <div
                        className={
                            chat.role === "user"
                                ? "userDiv"
                                : "divineDiv"
                        }
                        key={idx}
                    >

                        {chat.role === "user" ? (

                            <p className="userMessage">
                                {chat.content}
                            </p>

                        ) : (

                            <ReactMarkdown
                                rehypePlugins={[
                                    rehypeHighlight
                                ]}
                            >
                                {chat.content}
                            </ReactMarkdown>

                        )}

                    </div>

                ))}


                {/* Invisible element used for auto-scroll */}

                <div ref={chatEndRef}></div>

            </div>

        </>
    );
}

export default Chat;