import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Account() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAccount();
    }, []);

    const loadAccount = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                navigate("/login");
                return;
            }

            setUser(user);

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                throw error;
            }

            setProfile(profileData);

        } catch (error) {
            console.error("Account error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        navigate("/");
    };

    if (loading) {
        return (
            <main className="account-page">
                <div className="account-container">
                    <h2>Loading account...</h2>
                </div>
            </main>
        );
    }

    return (
        <main className="account-page">

            <div className="account-container">

                <span className="section-label">
                    ROOMNEST / ACCOUNT
                </span>

                <h1>
                    My Account
                </h1>

                <p className="account-subtitle">
                    Manage your RoomNest account.
                </p>


                {/* PROFILE */}

                <section className="account-card">

                    <div className="account-card-header">

                        <div className="account-avatar">
                            {profile?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <h2>
                                {profile?.full_name || "User"}
                            </h2>

                            <span className="account-role">
                                {profile?.role?.toUpperCase()}
                            </span>
                        </div>

                    </div>


                    <div className="account-details">

                        <div>
                            <strong>
                                Email
                            </strong>

                            <span>
                                {user?.email}
                            </span>
                        </div>


                        <div>
                            <strong>
                                Phone
                            </strong>

                            <span>
                                {profile?.phone || "Not added"}
                            </span>
                        </div>


                        <div>
                            <strong>
                                Account Type
                            </strong>

                            <span>
                                {profile?.role || "user"}
                            </span>
                        </div>

                    </div>

                </section>


                {/* QUICK ACTIONS */}

                <section className="account-card">

                    <h2>
                        Quick Actions
                    </h2>

                    <div className="account-actions">

                        <Link
                            to="/rooms"
                            className="account-action"
                        >
                            <span>🏠</span>

                            <div>
                                <strong>
                                    Find Rooms
                                </strong>

                                <p>
                                    Browse available rooms.
                                </p>
                            </div>
                        </Link>


                        <Link
                            to="/pg"
                            className="account-action"
                        >
                            <span>🏢</span>

                            <div>
                                <strong>
                                    Find PGs
                                </strong>

                                <p>
                                    Explore PG accommodations.
                                </p>
                            </div>
                        </Link>


                        <Link
                            to="/hostels"
                            className="account-action"
                        >
                            <span>🛏️</span>

                            <div>
                                <strong>
                                    Find Hostels
                                </strong>

                                <p>
                                    Explore hostels in Pune.
                                </p>
                            </div>
                        </Link>

                    </div>

                </section>


                {/* OWNER / BROKER */}

                {(profile?.role === "owner" ||
                    profile?.role === "broker") && (

                    <section className="account-card">

                        <h2>
                            Property Management
                        </h2>

                        <p>
                            Manage your RoomNest property listings.
                        </p>

                        <Link
                            to="/owner-dashboard"
                            className="account-dashboard-button"
                        >
                            Go to Dashboard →
                        </Link>

                    </section>

                )}


                {/* LOGOUT */}

                <button
                    className="account-logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </main>
    );
}

export default Account;