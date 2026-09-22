import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function OwnerDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [properties, setProperties] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    // ==============================
    // LOAD DASHBOARD
    // ==============================

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            // Get logged-in user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                navigate("/login");
                return;
            }

            setUser(user);

            // Get profile
            const { data: profileData, error: profileError } =
                await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

            if (profileError) {
                throw profileError;
            }

            // Only owner and broker can access this dashboard
            if (
                profileData.role !== "owner" &&
                profileData.role !== "broker"
            ) {
                alert("Only owners and brokers can access this dashboard.");
                navigate("/");
                return;
            }

            setProfile(profileData);

            // Get properties created by this owner/broker
            const { data: propertyData, error: propertyError } =
                await supabase
                    .from("properties")
                    .select("*")
                    .eq("owner_id", user.id)
                    .order("created_at", {
                        ascending: false,
                    });

            if (propertyError) {
                throw propertyError;
            }

            setProperties(propertyData || []);

        } catch (error) {
            console.error("Dashboard error:", error);
            setError(
                error.message || "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==============================
    // DELETE PROPERTY
    // ==============================

    const handleDelete = async (propertyId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this property?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const { error } = await supabase
                .from("properties")
                .delete()
                .eq("id", propertyId)
                .eq("owner_id", user.id);

            if (error) {
                throw error;
            }

            // Remove deleted property from screen
            setProperties((previous) =>
                previous.filter(
                    (property) => property.id !== propertyId
                )
            );

            alert("Property deleted successfully.");

        } catch (error) {
            console.error("Delete error:", error);

            alert(
                error.message ||
                "Unable to delete property."
            );
        }
    };

    // ==============================
    // LOGOUT
    // ==============================

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        navigate("/");
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <div className="dashboard-empty">
                        <div className="empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading dashboard...
                        </h3>

                        <p>
                            Please wait while we load your properties.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ==============================
    // ERROR
    // ==============================

    if (error) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <div className="dashboard-empty">

                        <div className="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            className="empty-add-button"
                            onClick={loadDashboard}
                        >
                            Try Again
                        </button>

                    </div>
                </div>
            </main>
        );
    }

    // ==============================
    // DASHBOARD
    // ==============================

    return (
        <main className="dashboard-page">

            <div className="dashboard-container">

                {/* ==============================
                    HEADER
                ============================== */}

                <div className="dashboard-header">

                    <div>

                        <span className="section-label">
                            ROOMNEST / {profile?.role?.toUpperCase()}
                        </span>

                        <h1>
                            Owner Dashboard
                        </h1>

                        <p>
                            Welcome back,{" "}
                            <strong>
                                {profile?.full_name || "Owner"}
                            </strong>
                            . Manage your properties and rental listings.
                        </p>

                    </div>

                    <div className="dashboard-header-actions">

                        <Link
                            to="/add-property"
                            className="add-property-button"
                        >
                            + Add Property
                        </Link>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>


                {/* ==============================
                    STATS
                ============================== */}

                <div className="dashboard-stats">

                    {/* Total Properties */}

                    <div className="dashboard-stat">

                        <span className="stat-icon">
                            🏠
                        </span>

                        <div>

                            <strong>
                                {properties.length}
                            </strong>

                            <span>
                                Total Properties
                            </span>

                        </div>

                    </div>


                    {/* Active Listings */}

                    <div className="dashboard-stat">

                        <span className="stat-icon">
                            ✓
                        </span>

                        <div>

                            <strong>
                                {properties.filter(
                                    (property) =>
                                        property.vacancy > 0
                                ).length}
                            </strong>

                            <span>
                                Active Listings
                            </span>

                        </div>

                    </div>


                    {/* Views */}

                    <div className="dashboard-stat">

                        <span className="stat-icon">
                            👁
                        </span>

                        <div>

                            <strong>
                                0
                            </strong>

                            <span>
                                Total Views
                            </span>

                        </div>

                    </div>


                    {/* Enquiries */}

                    <div className="dashboard-stat">

                        <span className="stat-icon">
                            📞
                        </span>

                        <div>

                            <strong>
                                0
                            </strong>

                            <span>
                                Enquiries
                            </span>

                        </div>

                    </div>

                </div>


                {/* ==============================
                    PROPERTIES
                ============================== */}

                <section className="dashboard-section">

                    <div className="dashboard-section-header">

                        <div>

                            <h2>
                                My Properties
                            </h2>

                            <p>
                                Manage your listed rooms, PGs and hostels.
                            </p>

                        </div>

                    </div>


                    {/* ==============================
                        EMPTY STATE
                    ============================== */}

                    {properties.length === 0 ? (

                        <div className="dashboard-empty">

                            <div className="empty-icon">
                                🏠
                            </div>

                            <h3>
                                No properties yet
                            </h3>

                            <p>
                                You haven't added any properties.
                                Start by adding your first property.
                            </p>

                            <Link
                                to="/add-property"
                                className="empty-add-button"
                            >
                                Add Your First Property
                            </Link>

                        </div>

                    ) : (

                        /* ==============================
                           PROPERTY LIST
                        ============================== */

                        <div className="owner-property-grid">

                            {properties.map((property) => (

                                <div
                                    className="owner-property-card"
                                    key={property.id}
                                >

                                    {/* TYPE */}

                                    <div className="owner-property-top">

                                        <span className="property-type-badge">
                                            {property.type}
                                        </span>

                                        {property.vacancy > 0 ? (

                                            <span className="property-active-badge">
                                                ● Active
                                            </span>

                                        ) : (

                                            <span className="property-full-badge">
                                                ● Full
                                            </span>

                                        )}

                                    </div>


                                    {/* TITLE */}

                                    <h3>
                                        {property.title}
                                    </h3>


                                    {/* LOCATION */}

                                    <p className="owner-property-location">
                                        📍 {property.location}
                                    </p>


                                    {/* DETAILS */}

                                    <div className="owner-property-details">

                                        <div>
                                            <strong>
                                                ₹{property.price}
                                            </strong>

                                            <span>
                                                / month
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                {property.vacancy}
                                            </strong>

                                            <span>
                                                vacancy
                                            </span>
                                        </div>

                                    </div>


                                    {/* EXTRA DETAILS */}

                                    <div className="owner-property-tags">

                                        {property.room_type && (
                                            <span>
                                                {property.room_type}
                                            </span>
                                        )}

                                        {property.gender && (
                                            <span>
                                                {property.gender}
                                            </span>
                                        )}

                                        {property.furnished && (
                                            <span>
                                                Furnished
                                            </span>
                                        )}

                                        {property.food && (
                                            <span>
                                                Food
                                            </span>
                                        )}

                                        {property.ac && (
                                            <span>
                                                AC
                                            </span>
                                        )}

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="owner-property-actions">

                                        <Link
                                            to={`/property/${property.id}`}
                                            className="view-property-button"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            to={`/edit-property/${property.id}`}
                                            className="edit-property-button"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            className="delete-property-button"
                                            onClick={() =>
                                                handleDelete(property.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </div>

        </main>
    );
}

export default OwnerDashboard;