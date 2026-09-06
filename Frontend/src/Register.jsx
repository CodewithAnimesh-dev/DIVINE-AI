import { useState } from "react";
import "./Register.css";

function Register({
    onRegisterSuccess,
    onLoginClick
}) {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {

        e.preventDefault();

        if (!username || !email || !password) {

            setMessage("Please fill all fields.");

            return;
        }

        setLoading(true);
        setMessage("");

        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setMessage(
                    data?.error ||
                    "Registration failed."
                );

                return;
            }

            setMessage(
                "Registration successful! Please login."
            );

            setUsername("");
            setEmail("");
            setPassword("");

            // Go to login after successful registration
            setTimeout(() => {

                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }

            }, 1000);

        } catch (error) {

            console.log(
                "Registration error:",
                error
            );

            setMessage(
                "Unable to connect to the server."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="registerPage">

            <div className="registerBox">

                <h1>Create Account</h1>

                <p className="registerSubtitle">
                    Create your Divine account
                </p>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

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
                            ? "Creating Account..."
                            : "Register"
                        }
                    </button>

                </form>

                {message && (

                    <p className="registerMessage">
                        {message}
                    </p>

                )}

                <p className="loginLink">

                    Already have an account?

                    <button
                        type="button"
                        onClick={onLoginClick}
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>

    );

}

export default Register;