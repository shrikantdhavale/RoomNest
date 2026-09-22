import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { supabase } from "../lib/supabase";
import demoPGProperties from "../data/pgProperties";

function PG() {
    const [properties, setProperties] = useState([]);

    const [search, setSearch] = useState("");
    const [gender, setGender] = useState("All");
    const [sharing, setSharing] = useState("All");
    const [maxBudget, setMaxBudget] = useState(15000);
    const [foodOnly, setFoodOnly] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================
    // LOAD PG PROPERTIES
    // =========================================

    useEffect(() => {
        loadPGProperties();
    }, []);

    const loadPGProperties = async () => {
        try {
            setLoading(true);
            setError("");

            // =====================================
            // GET REAL PG PROPERTIES
            // =====================================

            const {
                data: pgData,
                error: pgError,
            } = await supabase
                .from("properties")
                .select("*")
                .eq("type", "PG")
                .order("created_at", {
                    ascending: false,
                });

            if (pgError) {
                throw pgError;
            }

            const pgProperties =
                pgData || [];

            // =====================================
            // GET PG IMAGES
            // =====================================

            let imageData = [];

            if (pgProperties.length > 0) {

                const propertyIds =
                    pgProperties.map(
                        (pg) => pg.id
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
            // FORMAT PG DATA
            // =====================================

            const formattedPG =
                pgProperties.map((pg) => {

                    const pgImages =
                        imageData.filter(
                            (image) =>
                                image.property_id ===
                                pg.id
                        );

                    const firstImage =
                        pgImages.length > 0
                            ? pgImages[0].image_url
                            : null;

                    return {
                        id: `db-${pg.id}`,

                        image:
                            firstImage ||
                            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",

                        type: "PG",

                        title: pg.title,

                        location: pg.location,

                        price: pg.price,

                        vacancy: pg.vacancy,

                        rating: 0,

                        gender:
                            pg.gender || "Any",

                        sharing:
                            pg.sharing || null,

                        food:
                            pg.food || false,

                        furnished:
                            pg.furnished || false,

                        roomType:
                            pg.room_type || null,

                        tags: [
                            pg.sharing,

                            pg.food
                                ? "Food Included"
                                : null,

                            pg.furnished
                                ? "Furnished"
                                : null,
                        ].filter(Boolean),

                        databaseId:
                            pg.id,

                        description:
                            pg.description,

                        images:
                            pgImages.map(
                                (image) =>
                                    image.image_url
                            ),
                    };
                });

            // =====================================
            // DEMO + REAL PG DATA
            // =====================================

            setProperties([
                ...demoPGProperties,
                ...formattedPG,
            ]);

        } catch (error) {

            console.error(
                "Error loading PG properties:",
                error
            );

            setError(
                error.message ||
                "Unable to load PG properties."
            );

            // Keep demo PGs visible
            setProperties(
                demoPGProperties
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // FILTER PG
    // =========================================

    const filteredPG =
        properties.filter((pg) => {

            const matchesSearch =
                pg.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    ) ||

                pg.location
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesGender =
                gender === "All" ||
                pg.gender === gender;

            const matchesSharing =
                sharing === "All" ||
                pg.sharing === sharing;

            const matchesBudget =
                pg.price <= maxBudget;

            const matchesFood =
                !foodOnly ||
                pg.food === true;

            return (
                matchesSearch &&
                matchesGender &&
                matchesSharing &&
                matchesBudget &&
                matchesFood
            );
        });

    // =========================================
    // CLEAR FILTERS
    // =========================================

    const clearFilters = () => {
        setSearch("");
        setGender("All");
        setSharing("All");
        setMaxBudget(15000);
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
                        ROOMNEST / PG
                    </span>

                    <h1>
                        Find PGs in{" "}
                        <span>
                            Karve Nagar
                        </span>
                    </h1>

                    <p>
                        Find comfortable PG accommodations
                        with food, furnishing and flexible
                        sharing options.
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
                                    placeholder="Search PGs..."
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


                            {/* SHARING */}

                            <div className="filter-group">

                                <label>
                                    Sharing
                                </label>

                                <div className="filter-options">

                                    {[
                                        "All",
                                        "Single",
                                        "Double",
                                        "Triple",
                                        "4 Sharing",
                                    ].map(
                                        (option) => (

                                            <button
                                                key={
                                                    option
                                                }
                                                className={
                                                    sharing ===
                                                    option
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setSharing(
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
                                        Available PGs
                                    </h2>

                                    <p>

                                        {loading
                                            ? "Loading..."
                                            : `${filteredPG.length} ${
                                                filteredPG.length ===
                                                1
                                                    ? "PG"
                                                    : "PGs"
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
                                        Loading PGs...
                                    </h3>

                                    <p>
                                        Finding available PG
                                        accommodations.
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
                                            Unable to load PGs
                                        </h3>

                                        <p>
                                            {error}
                                        </p>

                                        <button
                                            onClick={
                                                loadPGProperties
                                            }
                                        >
                                            Try Again
                                        </button>

                                    </div>

                                )}


                            {/* PROPERTY GRID */}

                            {!loading &&
                                !error &&
                                filteredPG.length >
                                    0 && (

                                    <div className="property-grid">

                                        {filteredPG.map(
                                            (pg) => (

                                                <PropertyCard
                                                    key={
                                                        pg.id
                                                    }
                                                    {...pg}
                                                />

                                            )
                                        )}

                                    </div>

                                )}


                            {/* NO RESULTS */}

                            {!loading &&
                                !error &&
                                filteredPG.length ===
                                    0 && (

                                    <div className="no-results">

                                        <div className="no-results-icon">
                                            🏢
                                        </div>

                                        <h3>
                                            No PGs found
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

export default PG;