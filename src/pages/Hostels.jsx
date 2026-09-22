import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { supabase } from "../lib/supabase";
import demoHostelProperties from "../data/hostelProperties";

function Hostels() {
    const [properties, setProperties] = useState([]);

    const [search, setSearch] = useState("");
    const [gender, setGender] = useState("All");
    const [roomType, setRoomType] = useState("All");
    const [maxBudget, setMaxBudget] = useState(15000);
    const [acOnly, setAcOnly] = useState(false);
    const [foodOnly, setFoodOnly] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================
    // LOAD HOSTELS
    // =========================================

    useEffect(() => {
        loadHostels();
    }, []);

    const loadHostels = async () => {
        try {
            setLoading(true);
            setError("");

            // =====================================
            // GET REAL HOSTELS
            // =====================================

            const {
                data: hostelData,
                error: hostelError,
            } = await supabase
                .from("properties")
                .select("*")
                .eq("type", "HOSTEL")
                .order("created_at", {
                    ascending: false,
                });

            if (hostelError) {
                throw hostelError;
            }

            const hostels = hostelData || [];

            // =====================================
            // GET HOSTEL IMAGES
            // =====================================

            let imageData = [];

            if (hostels.length > 0) {
                const propertyIds =
                    hostels.map(
                        (hostel) => hostel.id
                    );

                const {
                    data,
                    error: imageError,
                } = await supabase
                    .from("property_images")
                    .select(
                        "id, property_id, image_url, created_at"
                    )
                    .in(
                        "property_id",
                        propertyIds
                    )
                    .order("created_at", {
                        ascending: true,
                    });

                if (imageError) {
                    throw imageError;
                }

                imageData = data || [];
            }

            // =====================================
            // FORMAT HOSTELS
            // =====================================

            const formattedHostels =
                hostels.map((hostel) => {

                    const hostelImages =
                        imageData.filter(
                            (image) =>
                                image.property_id ===
                                hostel.id
                        );

                    const firstImage =
                        hostelImages.length > 0
                            ? hostelImages[0].image_url
                            : null;

                    return {
                        id: `db-${hostel.id}`,

                        image:
                            firstImage ||
                            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",

                        type: "HOSTEL",

                        title: hostel.title,

                        location:
                            hostel.location,

                        price: hostel.price,

                        vacancy:
                            hostel.vacancy,

                        rating: 0,

                        gender:
                            hostel.gender ||
                            "Any",

                        roomType:
                            hostel.room_type ||
                            null,

                        ac:
                            hostel.ac ||
                            false,

                        food:
                            hostel.food ||
                            false,

                        furnished:
                            hostel.furnished ||
                            false,

                        tags: [
                            hostel.room_type,

                            hostel.ac
                                ? "AC"
                                : null,

                            hostel.food
                                ? "Food Included"
                                : null,

                            hostel.furnished
                                ? "Furnished"
                                : null,
                        ].filter(Boolean),

                        databaseId:
                            hostel.id,

                        description:
                            hostel.description,

                        images:
                            hostelImages.map(
                                (image) =>
                                    image.image_url
                            ),
                    };
                });

            // =====================================
            // DEMO + REAL HOSTELS
            // =====================================

            setProperties([
                ...demoHostelProperties,
                ...formattedHostels,
            ]);

        } catch (error) {

            console.error(
                "Error loading hostels:",
                error
            );

            setError(
                error.message ||
                "Unable to load hostels."
            );

            // Keep demo hostels visible
            setProperties(
                demoHostelProperties
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // FILTER HOSTELS
    // =========================================

    const filteredHostels =
        properties.filter((hostel) => {

            const matchesSearch =
                hostel.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    ) ||

                hostel.location
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesGender =
                gender === "All" ||
                hostel.gender === gender;

            const matchesRoomType =
                roomType === "All" ||
                hostel.roomType === roomType;

            const matchesBudget =
                hostel.price <= maxBudget;

            const matchesAc =
                !acOnly ||
                hostel.ac === true;

            const matchesFood =
                !foodOnly ||
                hostel.food === true;

            return (
                matchesSearch &&
                matchesGender &&
                matchesRoomType &&
                matchesBudget &&
                matchesAc &&
                matchesFood
            );
        });

    // =========================================
    // CLEAR FILTERS
    // =========================================

    const clearFilters = () => {
        setSearch("");
        setGender("All");
        setRoomType("All");
        setMaxBudget(15000);
        setAcOnly(false);
        setFoodOnly(false);
    };

    // =========================================
    // UI
    // =========================================

    return (
        <main>

            {/* ================= HEADER ================= */}

            <section className="listing-header">

                <div className="listing-container">

                    <span className="section-label">
                        ROOMNEST / HOSTELS
                    </span>

                    <h1>
                        Find Hostels in{" "}
                        <span>
                            Karve Nagar
                        </span>
                    </h1>

                    <p>
                        Discover affordable hostels with
                        comfortable rooms, useful amenities
                        and convenient locations.
                    </p>

                </div>

            </section>


            {/* ================= CONTENT ================= */}

            <section className="rooms-content">

                <div className="listing-container">

                    <div className="rooms-layout">

                        {/* ================= FILTERS ================= */}

                        <aside className="filter-sidebar">

                            <div className="filter-header">

                                <h3>
                                    Filters
                                </h3>

                                <button
                                    onClick={
                                        clearFilters
                                    }
                                    className="clear-filter"
                                >
                                    Clear
                                </button>

                            </div>


                            {/* SEARCH */}

                            <div className="filter-group">

                                <label>
                                    Search
                                </label>

                                <input
                                    type="text"
                                    placeholder="Search hostels..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* GENDER */}

                            <div className="filter-group">

                                <label>
                                    Gender
                                </label>

                                <div className="filter-options">

                                    {[
                                        "All",
                                        "Male",
                                        "Female",
                                    ].map(
                                        (option) => (

                                            <button
                                                key={
                                                    option
                                                }
                                                className={
                                                    gender ===
                                                    option
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setGender(
                                                        option
                                                    )
                                                }
                                            >
                                                {option}
                                            </button>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ROOM TYPE */}

                            <div className="filter-group">

                                <label>
                                    Room Type
                                </label>

                                <div className="filter-options">

                                    {[
                                        "All",
                                        "Single",
                                        "Double",
                                        "Triple",
                                        "Dormitory",
                                    ].map(
                                        (option) => (

                                            <button
                                                key={
                                                    option
                                                }
                                                className={
                                                    roomType ===
                                                    option
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setRoomType(
                                                        option
                                                    )
                                                }
                                            >
                                                {option}
                                            </button>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* BUDGET */}

                            <div className="filter-group">

                                <div className="budget-header">

                                    <label>
                                        Maximum Budget
                                    </label>

                                    <span>
                                        ₹
                                        {maxBudget.toLocaleString()}
                                    </span>

                                </div>

                                <input
                                    type="range"
                                    min="3000"
                                    max="15000"
                                    step="500"
                                    value={
                                        maxBudget
                                    }
                                    onChange={(e) =>
                                        setMaxBudget(
                                            Number(
                                                e.target
                                                    .value
                                            )
                                        )
                                    }
                                />

                            </div>


                            {/* AC */}

                            <div className="filter-group">

                                <label className="checkbox-label">

                                    <input
                                        type="checkbox"
                                        checked={
                                            acOnly
                                        }
                                        onChange={(e) =>
                                            setAcOnly(
                                                e.target
                                                    .checked
                                            )
                                        }
                                    />

                                    <span>
                                        AC only
                                    </span>

                                </label>

                            </div>


                            {/* FOOD */}

                            <div className="filter-group">

                                <label className="checkbox-label">

                                    <input
                                        type="checkbox"
                                        checked={
                                            foodOnly
                                        }
                                        onChange={(e) =>
                                            setFoodOnly(
                                                e.target
                                                    .checked
                                            )
                                        }
                                    />

                                    <span>
                                        Food included
                                    </span>

                                </label>

                            </div>

                        </aside>


                        {/* ================= RESULTS ================= */}

                        <div className="rooms-results">

                            <div className="results-header">

                                <div>

                                    <h2>
                                        Available Hostels
                                    </h2>

                                    <p>

                                        {loading
                                            ? "Loading..."
                                            : `${filteredHostels.length} ${
                                                filteredHostels.length ===
                                                1
                                                    ? "hostel"
                                                    : "hostels"
                                            } found`}

                                    </p>

                                </div>

                            </div>


                            {/* LOADING */}

                            {loading && (

                                <div className="no-results">

                                    <div className="no-results-icon">
                                        ⏳
                                    </div>

                                    <h3>
                                        Loading hostels...
                                    </h3>

                                    <p>
                                        Finding available hostels.
                                    </p>

                                </div>

                            )}


                            {/* ERROR */}

                            {!loading &&
                                error && (

                                    <div className="no-results">

                                        <div className="no-results-icon">
                                            ⚠️
                                        </div>

                                        <h3>
                                            Unable to load hostels
                                        </h3>

                                        <p>
                                            {error}
                                        </p>

                                        <button
                                            onClick={
                                                loadHostels
                                            }
                                        >
                                            Try Again
                                        </button>

                                    </div>

                                )}


                            {/* PROPERTY GRID */}

                            {!loading &&
                                !error &&
                                filteredHostels.length >
                                    0 && (

                                    <div className="property-grid">

                                        {filteredHostels.map(
                                            (hostel) => (

                                                <PropertyCard
                                                    key={
                                                        hostel.id
                                                    }
                                                    {...hostel}
                                                />

                                            )
                                        )}

                                    </div>

                                )}


                            {/* NO RESULTS */}

                            {!loading &&
                                !error &&
                                filteredHostels.length ===
                                    0 && (

                                    <div className="no-results">

                                        <div className="no-results-icon">
                                            🏨
                                        </div>

                                        <h3>
                                            No hostels found
                                        </h3>

                                        <p>
                                            Try changing
                                            your filters
                                            or search for
                                            something else.
                                        </p>

                                        <button
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Clear Filters
                                        </button>

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Hostels;