import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import properties from "../data/properties";
import pgProperties from "../data/pgProperties";
import hostelProperties from "../data/hostelProperties";

import { supabase } from "../lib/supabase";

function PropertyDetails() {
    const { id } = useParams();

    const [property, setProperty] = useState(null);
    const [images, setImages] = useState([]);
    const [ownerProfile, setOwnerProfile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================
    // LOAD PROPERTY
    // =========================================

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            setLoading(true);
            setError("");
            setProperty(null);
            setImages([]);
            setOwnerProfile(null);

            // =====================================
            // DEMO PROPERTY
            // =====================================

            if (!String(id).startsWith("db-")) {
                const allProperties = [
                    ...properties,
                    ...pgProperties,
                    ...hostelProperties,
                ];

                const demoProperty = allProperties.find(
                    (item) =>
                        String(item.id) === String(id)
                );

                if (!demoProperty) {
                    throw new Error(
                        "Property not found."
                    );
                }

                setProperty(demoProperty);

                setImages(
                    demoProperty.image
                        ? [demoProperty.image]
                        : []
                );

                return;
            }

            // =====================================
            // SUPABASE PROPERTY
            // =====================================

            const databaseId = String(id).replace(
                "db-",
                ""
            );

            const {
                data,
                error: propertyError,
            } = await supabase
                .from("properties")
                .select("*")
                .eq("id", databaseId)
                .single();

            if (propertyError) {
                throw propertyError;
            }

            if (!data) {
                throw new Error(
                    "Property not found."
                );
            }

            // =====================================
            // GET PROPERTY IMAGES
            // =====================================

            const {
                data: imageData,
                error: imageError,
            } = await supabase
                .from("property_images")
                .select("id, image_url")
                .eq(
                    "property_id",
                    databaseId
                )
                .order("created_at", {
                    ascending: true,
                });

            if (imageError) {
                throw imageError;
            }

            const uploadedImages =
                (imageData || []).map(
                    (image) => image.image_url
                );

            // =====================================
            // GET OWNER / BROKER CONTACT
            // =====================================

            if (data.owner_id) {
                const {
                    data: profileData,
                    error: profileError,
                } = await supabase.rpc(
                    "get_property_contact",
                    {
                        property_id_input: data.id,
                    }
                );

                if (profileError) {
                    console.error(
                        "Owner contact error:",
                        profileError
                    );
                } else if (
                    profileData &&
                    profileData.length > 0
                ) {
                    setOwnerProfile(
                        profileData[0]
                    );
                }
            }

            // =====================================
            // PROPERTY OBJECT
            // =====================================

            const formattedProperty = {
                id: `db-${data.id}`,

                type: data.type,

                title: data.title,

                location: data.location,

                price: data.price,

                vacancy: data.vacancy,

                rating: 0,

                roomType:
                    data.room_type || null,

                gender:
                    data.gender || null,

                sharing:
                    data.sharing || null,

                furnished:
                    data.furnished || false,

                food:
                    data.food || false,

                ac:
                    data.ac || false,

                description:
                    data.description || "",

                tags: [
                    data.room_type,

                    data.furnished
                        ? "Furnished"
                        : null,

                    data.food
                        ? "Food Included"
                        : null,

                    data.ac
                        ? "AC"
                        : null,
                ].filter(Boolean),
            };

            setProperty(
                formattedProperty
            );

            setImages(
                uploadedImages
            );

        } catch (error) {
            console.error(
                "Property loading error:",
                error
            );

            setError(
                error.message ||
                "Unable to load property."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // LOADING
    // =========================================

    if (loading) {
        return (
            <main className="property-details-page">
                <div className="property-details-container">
                    <div className="property-not-found">

                        <div className="not-found-icon">
                            ⏳
                        </div>

                        <h1>
                            Loading Property...
                        </h1>

                        <p>
                            Please wait while we
                            load the property.
                        </p>

                    </div>
                </div>
            </main>
        );
    }

    // =========================================
    // NOT FOUND
    // =========================================

    if (!property) {
        return (
            <main className="property-details-page">
                <div className="property-details-container">

                    <div className="property-not-found">

                        <div className="not-found-icon">
                            🏠
                        </div>

                        <h1>
                            Property Not Found
                        </h1>

                        <p>
                            {error ||
                                "Sorry, we couldn't find the property you're looking for."}
                        </p>

                        <Link to="/rooms">
                            Back to Rooms
                        </Link>

                    </div>

                </div>
            </main>
        );
    }

    // =========================================
    // IMAGE FALLBACK
    // =========================================

    const displayImages =
        images.length > 0
            ? images
            : [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            ];

    // =========================================
    // OWNER CONTACT
    // =========================================

    const ownerName =
        ownerProfile?.full_name ||
        "Property Owner";

    const ownerRole =
        ownerProfile?.role === "broker"
            ? "Broker"
            : "Property Owner";

    const ownerPhone =
        ownerProfile?.phone || "";

    // =========================================
    // NORMALIZE PHONE NUMBER
    // =========================================

    const normalizePhone = (phone) => {
        const digits = (phone || "").replace(
            /\D/g,
            ""
        );

        if (!digits) {
            return "";
        }

        // Indian 10-digit mobile number
        // Example: 9876543210
        // Becomes: 919876543210
        if (digits.length === 10) {
            return `91${digits}`;
        }

        // Already contains India's country code
        // Example: 919876543210
        if (
            digits.startsWith("91") &&
            digits.length === 12
        ) {
            return digits;
        }

        // Return other valid formats as entered
        return digits;
    };

    const whatsappPhone =
        normalizePhone(ownerPhone);

    // =========================================
    // WHATSAPP MESSAGE
    // =========================================

    const whatsappMessage =
        `Hello, I am interested in your ${property.type} listing "${property.title}" on RoomNest. Is it still available?`;

    const whatsappUrl =
        whatsappPhone
            ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                whatsappMessage
            )}`
            : "#";

    return (
        <main className="property-details-page">

            <div className="property-details-container">

                {/* =========================
                    BACK
                ========================= */}

                <Link
                    to="/"
                    className="back-button"
                >
                    ← Back to RoomNest
                </Link>


                {/* =========================
                    IMAGE GALLERY
                ========================= */}

                <section className="property-gallery">

                    <div className="gallery-main">

                        <img
                            src={displayImages[0]}
                            alt={property.title}
                        />

                        <span className="gallery-type">
                            {property.type}
                        </span>

                    </div>

                    <div className="gallery-side">

                        <img
                            src={
                                displayImages[1] ||
                                displayImages[0]
                            }
                            alt={`${property.title} interior`}
                        />

                        <img
                            src={
                                displayImages[2] ||
                                displayImages[0]
                            }
                            alt={`${property.title} room`}
                        />

                    </div>

                </section>


                {/* =========================
                    PROPERTY INFORMATION
                ========================= */}

                <section className="property-details-layout">

                    <div className="property-main-info">

                        <div className="property-detail-heading">

                            <div>

                                <span className="section-label">
                                    ROOMNEST /{" "}
                                    {property.type}
                                </span>

                                <h1>
                                    {property.title}
                                </h1>

                                <p className="detail-location">
                                    📍{" "}
                                    {property.location}
                                </p>

                            </div>

                            <div className="detail-rating">
                                ⭐{" "}
                                {property.rating}
                            </div>

                        </div>


                        {/* =========================
                            PRICE
                        ========================= */}

                        <div className="detail-price-box">

                            <div>

                                <span>
                                    Monthly Rent
                                </span>

                                <strong>
                                    ₹
                                    {property.price.toLocaleString()}
                                </strong>

                                <small>
                                    / month
                                </small>

                            </div>

                            <div className="detail-vacancy">

                                <span>
                                    Availability
                                </span>

                                <strong>

                                    {property.vacancy}{" "}

                                    {property.vacancy === 1
                                        ? "Room"
                                        : "Rooms"}{" "}

                                    Available

                                </strong>

                            </div>

                        </div>


                        {/* =========================
                            DETAILS
                        ========================= */}

                        <div className="property-info-section">

                            <h2>
                                Property Details
                            </h2>

                            <div className="detail-grid">

                                <div className="detail-item">

                                    <span>
                                        Property Type
                                    </span>

                                    <strong>
                                        {property.type}
                                    </strong>

                                </div>


                                {property.roomType && (
                                    <div className="detail-item">

                                        <span>
                                            Room Type
                                        </span>

                                        <strong>
                                            {property.roomType}
                                        </strong>

                                    </div>
                                )}


                                {property.furnished !==
                                    undefined && (
                                    <div className="detail-item">

                                        <span>
                                            Furnished
                                        </span>

                                        <strong>
                                            {property.furnished
                                                ? "Yes"
                                                : "No"}
                                        </strong>

                                    </div>
                                )}


                                {property.gender && (
                                    <div className="detail-item">

                                        <span>
                                            For
                                        </span>

                                        <strong>
                                            {property.gender}
                                        </strong>

                                    </div>
                                )}


                                {property.sharing && (
                                    <div className="detail-item">

                                        <span>
                                            Sharing
                                        </span>

                                        <strong>
                                            {property.sharing}
                                        </strong>

                                    </div>
                                )}


                                {property.ac !==
                                    undefined && (
                                    <div className="detail-item">

                                        <span>
                                            Air Conditioning
                                        </span>

                                        <strong>
                                            {property.ac
                                                ? "Available"
                                                : "Not Available"}
                                        </strong>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* =========================
                            AMENITIES
                        ========================= */}

                        <div className="property-info-section">

                            <h2>
                                Amenities
                            </h2>

                            <div className="amenities-list">

                                {property.tags.map(
                                    (tag, index) => (
                                        <div
                                            className="amenity"
                                            key={index}
                                        >

                                            <span>
                                                ✓
                                            </span>

                                            {tag}

                                        </div>
                                    )
                                )}

                            </div>

                        </div>


                        {/* =========================
                            DESCRIPTION
                        ========================= */}

                        <div className="property-info-section">

                            <h2>
                                About This Property
                            </h2>

                            <p className="property-description">

                                {property.description ||
                                    `${property.title} is located in ${property.location}. This listing is suitable for students and working professionals looking for a comfortable place to stay.`}

                            </p>

                        </div>

                    </div>


                    {/* =========================
                        CONTACT
                    ========================= */}

                    <aside className="contact-card">

                        <span className="contact-label">
                            INTERESTED IN THIS PROPERTY?
                        </span>

                        <h2>
                            Contact the {ownerRole}
                        </h2>

                        <p>
                            Get in touch with the{" "}
                            {ownerRole.toLowerCase()}{" "}
                            to check availability
                            and schedule a visit.
                        </p>


                        {/* =========================
                            OWNER INFO
                        ========================= */}

                        <div className="owner-info">

                            <div className="owner-avatar">
                                👤
                            </div>

                            <div>

                                <strong>
                                    {ownerName}
                                </strong>

                                <span>
                                    Verified Listing
                                </span>

                            </div>

                        </div>


                        {/* =========================
                            CONTACT BUTTONS
                        ========================= */}

                        <div className="contact-buttons">

                            {whatsappPhone ? (

                                <a
                                    href={`tel:+${whatsappPhone}`}
                                    className="call-button"
                                >
                                    📞 Call {ownerRole}
                                </a>

                            ) : (

                                <button
                                    type="button"
                                    className="call-button"
                                    disabled
                                >
                                    📞 Phone Not Available
                                </button>

                            )}


                            {whatsappPhone ? (

                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-button"
                                >
                                    💬 WhatsApp
                                </a>

                            ) : (

                                <button
                                    type="button"
                                    className="whatsapp-button"
                                    disabled
                                >
                                    💬 WhatsApp Not Available
                                </button>

                            )}

                        </div>


                        {/* =========================
                            WARNING
                        ========================= */}

                        <div className="contact-warning">

                            🛡️ Never pay money before
                            physically verifying the property.

                        </div>

                    </aside>

                </section>

            </div>

        </main>
    );
}

export default PropertyDetails;