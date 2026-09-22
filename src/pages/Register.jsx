import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        accountType: "user",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================
    // HANDLE INPUT
    // =========================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================
    // REGISTER
    // =========================================

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim() ||
            !formData.password
        ) {
            setError(
                "Please fill all fields."
            );
            return;
        }

        if (
            formData.password.length < 6
        ) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            // =====================================
            // CREATE SUPABASE AUTH ACCOUNT
            // =====================================

            const {
                error: authError,
            } =
                await supabase.auth.signUp({
                    email:
                        formData.email.trim(),

                    password:
                        formData.password,

                    options: {
                        data: {
                            full_name:
                                formData.name.trim(),

                            phone:
                                formData.phone.trim(),

                            role:
                                formData.accountType,
                        },
                    },
                });

            if (authError) {
                throw authError;
            }

            alert(
                "Account created successfully!"
            );

            navigate("/login");

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong. Please try again."
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

                        {/* ROOMNEST BRAND */}

                        <div className="auth-brand">

                            <div className="auth-brand-icon">
                                RN
                            </div>

                            {/* <span className="auth-brand-name">
                                RoomNest
                            </span> */}

                        </div>


                        <h1>
                            Create your account
                        </h1>

                        <p>
                            Find your perfect place or
                            list your property.
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
                        onSubmit={handleRegister}
                    >

                        {/* FULL NAME */}

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                        </div>


                        {/* PHONE */}

                        <div className="form-group">

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                        </div>


                        {/* =================================
                            ACCOUNT TYPE
                        ================================= */}

                        <div className="form-group">

                            <label>
                                Account Type
                            </label>


                            <div className="account-type-options">

                                {/* USER */}

                                <button
                                    type="button"
                                    className={
                                        `account-type ${
                                            formData.accountType ===
                                            "user"
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                accountType:
                                                    "user",
                                            })
                                        )
                                    }
                                >
                                    👤 User
                                </button>


                                {/* OWNER */}

                                <button
                                    type="button"
                                    className={
                                        `account-type ${
                                            formData.accountType ===
                                            "owner"
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                accountType:
                                                    "owner",
                                            })
                                        )
                                    }
                                >
                                    🏠 Owner
                                </button>


                                {/* BROKER */}

                                <button
                                    type="button"
                                    className={
                                        `account-type ${
                                            formData.accountType ===
                                            "broker"
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                accountType:
                                                    "broker",
                                            })
                                        )
                                    }
                                >
                                    💼 Broker
                                </button>

                            </div>

                        </div>


                        {/* =================================
                            SUBMIT
                        ================================= */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>


                    {/* =================================
                        LOGIN LINK
                    ================================= */}

                    <div className="auth-switch">

                        Already have an account?{" "}

                        <Link to="/login">
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Register;