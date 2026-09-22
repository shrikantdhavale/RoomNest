import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Navbar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        loadUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            loadUser();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // =====================================
    // LOAD CURRENT USER
    // =====================================

    const loadUser = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setUser(null);
                setRole(null);
                return;
            }

            setUser(user);

            // Get profile using our Supabase function
            const {
                data: profile,
                error: profileError,
            } = await supabase.rpc("get_my_profile");

            if (profileError) {
                console.error(
                    "Profile loading error:",
                    profileError
                );

                setRole(null);
                return;
            }

            setRole(profile?.role || null);

        } catch (error) {
            console.error(
                "Navbar user error:",
                error
            );

            setUser(null);
            setRole(null);
        }
    };


    // =====================================
    // LIST YOUR PROPERTY
    // =====================================

    const handleListProperty = () => {

        // Not logged in
        if (!user) {
            navigate("/list-property");
            return;
        }

        // Owner / Broker
        if (
            role === "owner" ||
            role === "broker"
        ) {
            navigate("/add-property");
            return;
        }

        // Normal User
        navigate("/list-property");
    };


    return (
        <nav className="navbar">

            <div className="navbar-container">

                {/* =========================
                    LOGO
                ========================= */}

                <Link
                    to="/"
                    className="logo"
                >
                    <span className="logo-icon">
                        ⌂
                    </span>

                    <span>
                        RoomNest
                    </span>
                </Link>


                {/* =========================
                    NAVIGATION
                ========================= */}

                <div className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/rooms">
                        Rooms
                    </Link>

                    <Link to="/pg">
                        PG
                    </Link>

                    <Link to="/hostels">
                        Hostels
                    </Link>

                </div>


                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="nav-actions">

                    {/* LOGIN / ACCOUNT */}

                    {!user ? (

                        <Link
                            to="/login"
                            className="login-btn"
                        >
                            Login
                        </Link>

                    ) : (

                        <button
                            className="login-btn"
                            onClick={() =>
                                navigate("/account")
                            }
                        >
                            Account
                        </button>

                    )}


                    {/* LIST YOUR PROPERTY */}

                    <button
                        className="list-btn"
                        onClick={handleListProperty}
                    >
                        List Your Property
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;