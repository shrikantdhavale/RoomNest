import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { supabase } from "../lib/supabase";
import demoProperties from "../data/properties";

function Rooms() {
    const [properties, setProperties] = useState([]);

    const [search, setSearch] = useState("");
    const [roomType, setRoomType] = useState("All");
    const [maxBudget, setMaxBudget] = useState(15000);
    const [furnishedOnly, setFurnishedOnly] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================
    // LOAD ROOMS
    // =========================================

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            setError("");

            // =====================================
            // GET REAL ROOMS
            // =====================================

            const {
                data: roomsData,
                error: roomsError,
            } = await supabase
                .from("properties")
                .select("*")
                .eq("type", "ROOM")
                .order("created_at", {
                    ascending: false,
                });

            if (roomsError) {
                throw roomsError;
            }

            const rooms = roomsData || [];

            // =====================================
            // GET IMAGES FOR ALL ROOMS
            // =====================================

            let imageData = [];

            if (rooms.length > 0) {

                const propertyIds =
                    rooms.map((room) => room.id);

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
            // FORMAT ROOMS
            // =====================================

            const formattedRooms = rooms.map(
                (room) => {

                    // Find images belonging
                    // to this property
                    const roomImages =
                        imageData.filter(
                            (image) =>
                                image.property_id ===
                                room.id
                        );

                    // First uploaded image
                    const firstImage =
                        roomImages.length > 0
                            ? roomImages[0].image_url
                            : null;

                    return {
                        id: `db-${room.id}`,

                        // REAL UPLOADED IMAGE
                        image:
                            firstImage ||
                            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",

                        type: "ROOM",

                        title: room.title,

                        location: room.location,

                        price: room.price,

                        vacancy: room.vacancy,

                        rating: 0,

                        roomType:
                            room.room_type ||
                            "Single",

                        furnished:
                            room.furnished ||
                            false,

                        tags: [
                            room.room_type,

                            room.furnished
                                ? "Furnished"
                                : null,
                        ].filter(Boolean),

                        databaseId: room.id,

                        description:
                            room.description,

                        // Keep all images available
                        // for future use
                        images:
                            roomImages.map(
                                (image) =>
                                    image.image_url
                            ),
                    };
                }
            );

            // =====================================
            // DEMO + REAL DATA
            // =====================================

            setProperties([
                ...demoProperties,
                ...formattedRooms,
            ]);

        } catch (error) {

            console.error(
                "Error loading rooms:",
                error
            );

            setError(
                error.message ||
                "Unable to load rooms."
            );

            // Still show demo rooms
            setProperties(
                demoProperties
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // FILTER ROOMS
    // =========================================

    const filteredRooms =
        properties.filter((room) => {

            const matchesSearch =
                room.title
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    ) ||

                room.location
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesRoomType =
                roomType === "All" ||
                room.roomType === roomType;

            const matchesBudget =
                room.price <= maxBudget;

            const matchesFurnished =
                !furnishedOnly ||
                room.furnished === true;

            return (
                matchesSearch &&
                matchesRoomType &&
                matchesBudget &&
                matchesFurnished
            );
        });

    // =========================================
    // CLEAR FILTERS
    // =========================================

    const clearFilters = () => {
        setSearch("");
        setRoomType("All");
        setMaxBudget(15000);
        setFurnishedOnly(false);
    };

    // =========================================
    // UI
    // =========================================

    return (
        <main>

            {/* HEADER */}

            <section className="listing-header">

                <div className="listing-container">

                    <span className="section-label">
                        ROOMNEST / ROOMS
                    </span>

                    <h1>
                        Find Rooms in{" "}
                        <span>
                            Karve Nagar
                        </span>
                    </h1>

                    <p>
                        Discover comfortable and affordable
                        rooms that match your lifestyle and
                        budget.
                    </p>

                </div>

            </section>


            {/* CONTENT */}

            <section className="rooms-content">

                <div className="listing-container">

                    <div className="rooms-layout">

                        {/* FILTER SIDEBAR */}

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
                                    placeholder="Search rooms..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

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
                                        "Shared",
                                    ].map(
                                        (type) => (

                                            <button
                                                key={
                                                    type
                                                }
                                                className={
                                                    roomType ===
                                                    type
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setRoomType(
                                                        type
                                                    )
                                                }
                                            >
                                                {type}
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
                                    min="4000"
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


                            {/* FURNISHED */}

                            <div className="filter-group">

                                <label className="checkbox-label">

                                    <input
                                        type="checkbox"
                                        checked={
                                            furnishedOnly
                                        }
                                        onChange={(e) =>
                                            setFurnishedOnly(
                                                e.target
                                                    .checked
                                            )
                                        }
                                    />

                                    <span>
                                        Furnished only
                                    </span>

                                </label>

                            </div>

                        </aside>


                        {/* RESULTS */}

                        <div className="rooms-results">

                            <div className="results-header">

                                <div>

                                    <h2>
                                        Available Rooms
                                    </h2>

                                    <p>

                                        {loading
                                            ? "Loading..."
                                            : `${filteredRooms.length} ${
                                                filteredRooms.length ===
                                                1
                                                    ? "room"
                                                    : "rooms"
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
                                        Loading rooms...
                                    </h3>

                                    <p>
                                        Finding available rooms.
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
                                            Unable to load rooms
                                        </h3>

                                        <p>
                                            {error}
                                        </p>

                                        <button
                                            onClick={
                                                loadRooms
                                            }
                                        >
                                            Try Again
                                        </button>

                                    </div>

                                )}


                            {/* PROPERTY GRID */}

                            {!loading &&
                                !error &&
                                filteredRooms.length >
                                    0 && (

                                    <div className="property-grid">

                                        {filteredRooms.map(
                                            (room) => (

                                                <PropertyCard
                                                    key={
                                                        room.id
                                                    }
                                                    {...room}
                                                />

                                            )
                                        )}

                                    </div>

                                )}


                            {/* NO RESULTS */}

                            {!loading &&
                                !error &&
                                filteredRooms.length ===
                                    0 && (

                                    <div className="no-results">

                                        <div className="no-results-icon">
                                            🏠
                                        </div>

                                        <h3>
                                            No rooms found
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

export default Rooms;