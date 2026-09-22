import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            // =====================================
            // LOGIN
            // =====================================

            const {
                data,
                error: loginError,
            } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (loginError) {
                throw loginError;
            }

            if (!data.user) {
                throw new Error("Unable to login.");
            }

            // =====================================
            // GET PROFILE
            // =====================================

            const {
                data: profile,
                error: profileError,
            } = await supabase.rpc("get_my_profile");

            if (profileError) {
                throw profileError;
            }

            if (!profile) {
                throw new Error(
                    "Your account profile could not be found."
                );
            }

            console.log(
                "Logged in profile:",
                profile
            );

            // =====================================
            // REDIRECT BASED ON ROLE
            // =====================================

            if (
                profile.role === "owner" ||
                profile.role === "broker"
            ) {
                navigate("/owner-dashboard");
            } else {
                navigate("/");
            }

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <div className="auth-container">

                <div className="auth-card">

                    {/* =================================
                        HEADER
                    ================================= */}

                    <div className="auth-header">

                        {/* ROOMNEST LOGO */}

                        <div className="auth-brand">

                            <div className="auth-brand-icon">
                                RN
                            </div>

                        

                        </div>


                        <h1>
                            Welcome Back
                        </h1>

                        <p>
                            Login to continue to RoomNest.
                        </p>

                    </div>


                    {/* =================================
                        ERROR
                    ================================= */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* =================================
                        FORM
                    ================================= */}

                    <form
                        className="auth-form"
                        onSubmit={handleLogin}
                    >

                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>


                    {/* =================================
                        REGISTER
                    ================================= */}

                    <div className="auth-switch">

                        Don't have an account?{" "}

                        <Link to="/register">
                            Create Account
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Login;