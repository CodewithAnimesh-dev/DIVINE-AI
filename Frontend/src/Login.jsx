import { useState } from "react";
import "./Login.css";

function Login({
    onLoginSuccess,
    onRegisterClick
}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!email || !password) {

            setMessage("Please enter email and password.");

            return;
        }

        setLoading(true);
        setMessage("");

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setMessage(
                    data?.error ||
                    "Login failed."
                );

                return;
            }

            setMessage(
                data?.message ||
                "Login successful!"
            );

            // Tell App.jsx that login succeeded
            if (data?.user) {

                onLoginSuccess(data.user);

            }

        } catch (error) {

            console.log("Login error:", error);

            setMessage(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="loginPage">

            <div className="loginBox">

                <h1>Welcome Back</h1>

                <p className="loginSubtitle">
                    Login to your Divine account
                </p>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"
                        }
                    </button>

                </form>

                {message && (

                    <p className="loginMessage">
                        {message}
                    </p>

                )}

                <p className="registerLink">

                    Don't have an account?

                    <button
                        type="button"
                        onClick={onRegisterClick}
                    >
                        Register
                    </button>

                </p>

            </div>

        </div>

    );

}

export default Login;