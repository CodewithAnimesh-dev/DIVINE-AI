import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import VoiceInput from "./VoiceInput.jsx";
import { MyContext } from "./MyContext.jsx";
import {
    useContext,
    useState,
    useRef,
    useEffect
} from "react";
import { RingLoader } from "react-spinners";

function ChatWindow() {

    const {
        prompt,
        setPrompt,
        currThreadId,
        setPrevChats,
        setNewChat,
        darkMode,
        toggleTheme,
        handleLogout,
        user
    } = useContext(MyContext);


    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    // =========================
    // IMAGE UPLOAD
    // =========================

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState(null);

    const fileInputRef = useRef(null);


    // =========================
    // CLEAN UP IMAGE PREVIEW
    // =========================

    useEffect(() => {

        return () => {

            if (imagePreview) {

                URL.revokeObjectURL(
                    imagePreview
                );

            }

        };

    }, [imagePreview]);


    // =========================
    // HANDLE IMAGE SELECTION
    // =========================

    const handleImageChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }


        // Only allow images

        if (!file.type.startsWith("image/")) {

            alert("Please select an image file.");

            return;

        }


        // Remove old preview if it exists

        if (imagePreview) {

            URL.revokeObjectURL(
                imagePreview
            );

        }


        // Create preview URL

        const previewUrl =
            URL.createObjectURL(file);


        setSelectedImage(file);

        setImagePreview(previewUrl);


        // Allows user to select
        // the same image again

        e.target.value = "";

    };


    // =========================
    // REMOVE SELECTED IMAGE
    // =========================

    const removeSelectedImage = () => {

        if (imagePreview) {

            URL.revokeObjectURL(
                imagePreview
            );

        }


        setSelectedImage(null);

        setImagePreview(null);

    };


    // =========================
    // CONVERT IMAGE TO BASE64
    // =========================

    const convertImageToBase64 = (file) => {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();


            reader.onload = () => {

                try {

                    const result =
                        reader.result;


                    const base64Data =
                        result.split(",")[1];


                    resolve(base64Data);

                } catch (error) {

                    reject(error);

                }

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Failed to read image."
                    )
                );

            };


            reader.readAsDataURL(file);

        });

    };


    // =========================
    // GET REPLY
    // =========================

    const getReply = async () => {

        // Prevent multiple requests

        if (loading) {
            return;
        }


        // Require text or image

        if (
            !prompt.trim() &&
            !selectedImage
        ) {

            return;

        }


        const userMessage =
            prompt.trim();


        const imageToSend =
            selectedImage;


        // Clear text

        setPrompt("");


        // Remove image preview
        // after clicking send

        removeSelectedImage();


        setNewChat(false);


        // =========================
        // SHOW USER MESSAGE
        // =========================

        setPrevChats(prevChats => [

            ...prevChats,

            {
                role: "user",

                content:
                    userMessage ||
                    "📷 Image uploaded"
            }

        ]);


        setLoading(true);


        try {

            // =========================
            // PREPARE IMAGE
            // =========================

            let imageData = null;


            if (imageToSend) {

                const base64Data =
                    await convertImageToBase64(
                        imageToSend
                    );


                imageData = {

                    mimeType:
                        imageToSend.type,

                    data:
                        base64Data

                };

            }


            // =========================
            // SEND REQUEST
            // =========================

            const response = await fetch(

    `${import.meta.env.VITE_API_URL}/api/chat`,

    {

        method: "POST",

        credentials: "include",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify({

            message:
                userMessage,

            threadId:
                currThreadId,

            image:
                imageData

        })

    }

);


            const res =
                await response.json();


            // =========================
            // NOT AUTHENTICATED
            // =========================

            if (
                response.status === 401
            ) {

                setPrevChats(prevChats => [

                    ...prevChats,

                    {

                        role: "assistant",

                        content:
                            "You are not logged in. Please login before sending a message."

                    }

                ]);

                return;

            }


            // =========================
            // GEMINI QUOTA ERROR
            // =========================

            if (
                response.status === 429
            ) {

                setPrevChats(prevChats => [

                    ...prevChats,

                    {

                        role: "assistant",

                        content:

                            res?.error ||

                            "Divine is temporarily unavailable."

                    }

                ]);

                return;

            }


            // =========================
            // OTHER SERVER ERRORS
            // =========================

            if (!response.ok) {

                setPrevChats(prevChats => [

                    ...prevChats,

                    {

                        role: "assistant",

                        content:

                            res?.error ||

                            "Something went wrong. Please try again."

                    }

                ]);

                return;

            }


            // =========================
            // SUCCESS
            // =========================

            if (res?.reply) {

                setPrevChats(prevChats => [

                    ...prevChats,

                    {

                        role: "assistant",

                        content:
                            res.reply

                    }

                ]);

            }


        } catch (error) {

            console.log(
                "Chat error:",
                error
            );


            setPrevChats(prevChats => [

                ...prevChats,

                {

                    role: "assistant",

                    content:
                        "Unable to connect to the Divine server."

                }

            ]);


        } finally {

            setLoading(false);

        }

    };


    // =========================
    // CHANGE THEME
    // =========================

    const handleThemeChange = (mode) => {

        if (
            mode === "dark" &&
            !darkMode
        ) {

            toggleTheme();

        }


        if (
            mode === "light" &&
            darkMode
        ) {

            toggleTheme();

        }

    };


    return (

        <div className="chatWindow">


            {/* =========================
                NAVBAR
            ========================= */}

            <div className="navbar">

                <span>

                    Divine

                    <i className="fa-solid fa-chevron-down"></i>

                </span>


                <div
                    className="userIconDiv"

                    onClick={() =>
                        setIsOpen(
                            prev => !prev
                        )
                    }
                >

                    <span className="userIcon">

                        <i className="fa-solid fa-user"></i>

                    </span>

                </div>

            </div>


            {/* =========================
                DROPDOWN
            ========================= */}

            {isOpen && (

                <div className="dropDown">


                    <div className="dropDownItem">

                        <i className="fa-solid fa-gear"></i>

                        Settings

                    </div>


                    {/* DARK MODE */}

                    <div

                        className={`dropDownItem ${
                            darkMode
                                ? "activeMode"
                                : ""
                        }`}

                        onClick={() =>
                            handleThemeChange(
                                "dark"
                            )
                        }

                    >

                        <i className="fa-solid fa-moon"></i>

                        Dark mode

                    </div>


                    {/* LIGHT MODE */}

                    <div

                        className={`dropDownItem ${
                            !darkMode
                                ? "activeMode"
                                : ""
                        }`}

                        onClick={() =>
                            handleThemeChange(
                                "light"
                            )
                        }

                    >

                        <i className="fa-solid fa-sun"></i>

                        Light mode

                    </div>


                    <div className="dropDownItem">

                        <i className="fa-solid fa-cloud-arrow-up"></i>

                        Upgrade plan

                    </div>


                    {/* LOGOUT */}

                    <div

                        className="dropDownItem"

                        onClick={async () => {

                            setIsOpen(false);

                            await handleLogout();

                        }}

                    >

                        <i className="fa-solid fa-arrow-right-from-bracket"></i>

                        Log out

                    </div>


                </div>

            )}


            {/* =========================
                CHAT
            ========================= */}

            <Chat />


            {/* =========================
                CHAT INPUT AREA
            ========================= */}

            <div className="chatInput">


                {/* =========================
                    LOADER
                ========================= */}

                {loading && (

                    <div className="loader">

                        <RingLoader

                            color="#7C83FF"

                            size={30}

                            speedMultiplier={1}

                        />

                    </div>

                )}


                {/* =========================
                    IMAGE PREVIEW
                ========================= */}

                {imagePreview && (

                    <div className="imagePreviewContainer">


                        <img
                            src={imagePreview}
                            alt="Selected preview"
                            className="imagePreview"
                        />


                        <button
                            className="removeImageButton"
                            onClick={removeSelectedImage}
                            type="button"
                            title="Remove image"
                        >

                            <i className="fa-solid fa-xmark"></i>

                        </button>


                    </div>

                )}


                {/* =========================
                    INPUT BOX
                ========================= */}

                <div className="inputBox">


                    {/* TEXT INPUT */}

                    <input

                        type="text"

                        placeholder={`Ask anything, ${
                            user?.username || ""
                        }`}

                        value={prompt}

                        disabled={loading}


                        onChange={(e) =>
                            setPrompt(
                                e.target.value
                            )
                        }


                        onKeyDown={(e) => {

                            if (

                                e.key === "Enter" &&

                                !e.shiftKey

                            ) {

                                e.preventDefault();

                                getReply();

                            }

                        }}

                    />


                    {/* HIDDEN IMAGE INPUT */}

                    <input

                        type="file"

                        accept="image/*"

                        ref={fileInputRef}

                        onChange={
                            handleImageChange
                        }

                        style={{
                            display: "none"
                        }}

                    />


                    {/* IMAGE UPLOAD BUTTON */}

                    <div

                        className="imageUpload"

                        onClick={() => {

                            if (!loading) {

                                fileInputRef.current?.click();

                            }

                        }}

                        title="Upload image"

                    >

                        <i className="fa-solid fa-image"></i>

                    </div>


                    {/* VOICE INPUT */}

                    <VoiceInput

                        onText={(text) => {

                            setPrompt(prev =>

                                prev

                                    ? `${prev} ${text}`

                                    : text

                            );

                        }}

                    />


                    {/* SEND BUTTON */}

                    <div

                        id="submit"

                        onClick={getReply}

                    >

                        <i className="fa-solid fa-paper-plane"></i>

                    </div>


                </div>


                {/* INFO */}

                <p className="info">

                    Divine can make mistakes.
                    Check important info.
                    See Cookie Preferences.

                </p>


            </div>


        </div>

    );

}


export default ChatWindow;