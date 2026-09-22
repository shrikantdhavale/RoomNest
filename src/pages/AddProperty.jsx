import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AddProperty() {
    const navigate = useNavigate();

    const [propertyType, setPropertyType] = useState("ROOM");

    const [formData, setFormData] = useState({
        title: "",
        location: "Karve Nagar, Pune",
        price: "",
        vacancy: "",
        roomType: "Single",
        gender: "Any",
        description: "",
        furnished: false,
        food: false,
        ac: false,
    });

    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================
    // HANDLE FORM INPUT
    // =========================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =========================================
    // HANDLE IMAGES
    // =========================================

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(
            e.target.files
        );

        // Maximum 8 images
        if (selectedFiles.length > 8) {
            setError(
                "You can upload a maximum of 8 images."
            );
            return;
        }

        // Maximum 5 MB per image
        const invalidFile = selectedFiles.find(
            (file) => file.size > 5 * 1024 * 1024
        );

        if (invalidFile) {
            setError(
                "Each image must be smaller than 5 MB."
            );
            return;
        }

        setError("");
        setImages(selectedFiles);
    };

    // =========================================
    // SUBMIT PROPERTY
    // =========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !formData.title.trim() ||
            !formData.price ||
            !formData.vacancy
        ) {
            setError(
                "Please fill all required fields."
            );
            return;
        }

        try {
            setLoading(true);

            // =====================================
            // 1. GET LOGGED-IN USER
            // =====================================

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                throw new Error(
                    "You must be logged in to publish a property."
                );
            }

            // =====================================
            // 2. GET PROFILE
            // =====================================

            const {
                data: profile,
                error: profileError,
            } = await supabase.rpc(
                "get_my_profile"
            );

            if (profileError) {
                throw profileError;
            }

            if (!profile) {
                throw new Error(
                    "Your profile could not be found."
                );
            }

            // =====================================
            // 3. CHECK ROLE
            // =====================================

            if (
                profile.role !== "owner" &&
                profile.role !== "broker"
            ) {
                throw new Error(
                    "Only owners and brokers can publish properties."
                );
            }

            // =====================================
            // 4. CREATE PROPERTY
            // =====================================

            const {
                data: property,
                error: propertyError,
            } = await supabase
                .from("properties")
                .insert({
                    owner_id: user.id,

                    type: propertyType,

                    title:
                        formData.title.trim(),

                    location:
                        formData.location.trim(),

                    price:
                        Number(formData.price),

                    vacancy:
                        Number(formData.vacancy),

                    room_type:
                        formData.roomType,

                    gender:
                        formData.gender,

                    furnished:
                        formData.furnished,

                    food:
                        formData.food,

                    ac:
                        formData.ac,

                    description:
                        formData.description.trim() ||
                        null,
                })
                .select()
                .single();

            if (propertyError) {
                throw propertyError;
            }

            // =====================================
            // 5. UPLOAD IMAGES
            // =====================================

            for (const image of images) {

                const extension =
                    image.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                const fileName =
                    `${user.id}/${property.id}/${crypto.randomUUID()}.${extension}`;

                // Upload to Storage
                const {
                    error: uploadError,
                } = await supabase.storage
                    .from("property-images")
                    .upload(
                        fileName,
                        image,
                        {
                            cacheControl: "3600",
                            upsert: false,
                        }
                    );

                if (uploadError) {
                    throw uploadError;
                }

                // Get public URL
                const {
                    data: publicUrlData,
                } = supabase.storage
                    .from("property-images")
                    .getPublicUrl(
                        fileName
                    );

                const imageUrl =
                    publicUrlData.publicUrl;

                // =================================
                // 6. SAVE URL IN DATABASE
                // =================================

                const {
                    error:
                        imageInsertError,
                } = await supabase
                    .from("property_images")
                    .insert({
                        property_id:
                            property.id,

                        image_url:
                            imageUrl,
                    });

                if (imageInsertError) {
                    throw imageInsertError;
                }
            }

            // =====================================
            // SUCCESS
            // =====================================

            alert(
                "Property published successfully!"
            );

            navigate(
                "/owner-dashboard"
            );

        } catch (error) {

            console.error(
                "Property submission error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong while publishing the property."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // UI
    // =========================================

    return (
        <main className="add-property-page">

            <div className="add-property-container">

                {/* HEADER */}

                <div className="add-property-header">

                    <span className="section-label">
                        ROOMNEST / LIST PROPERTY
                    </span>

                    <h1>
                        Add Your Property
                    </h1>

                    <p>
                        Create a listing and reach people
                        looking for rooms, PGs and hostels.
                    </p>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}


                <form
                    className="property-form"
                    onSubmit={handleSubmit}
                >

                    {/* PROPERTY TYPE */}

                    <section className="form-section">

                        <div className="form-section-heading">

                            <span>01</span>

                            <div>
                                <h2>
                                    Property Type
                                </h2>

                                <p>
                                    What are you listing?
                                </p>
                            </div>

                        </div>


                        <div className="property-type-options">

                            {[
                                "ROOM",
                                "PG",
                                "HOSTEL",
                            ].map((type) => (

                                <button
                                    key={type}
                                    type="button"
                                    className={
                                        propertyType === type
                                            ? "property-type-option active"
                                            : "property-type-option"
                                    }
                                    onClick={() =>
                                        setPropertyType(type)
                                    }
                                >

                                    <span>
                                        {type === "ROOM"
                                            ? "🏠"
                                            : type === "PG"
                                                ? "🏢"
                                                : "🛏️"}
                                    </span>

                                    <strong>
                                        {type === "ROOM"
                                            ? "Room"
                                            : type === "PG"
                                                ? "PG"
                                                : "Hostel"}
                                    </strong>

                                </button>

                            ))}

                        </div>

                    </section>


                    {/* BASIC INFORMATION */}

                    <section className="form-section">

                        <div className="form-section-heading">

                            <span>02</span>

                            <div>
                                <h2>
                                    Basic Information
                                </h2>

                                <p>
                                    Tell people about your property.
                                </p>
                            </div>

                        </div>


                        <div className="form-grid">

                            <div className="form-field full">

                                <label>
                                    Property Title *
                                </label>

                                <input
                                    name="title"
                                    type="text"
                                    placeholder="Example: Spacious furnished room near college"
                                    value={formData.title}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Location *
                                </label>

                                <input
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Monthly Rent *
                                </label>

                                <input
                                    name="price"
                                    type="number"
                                    min="1"
                                    placeholder="₹ 8000"
                                    value={formData.price}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Available Vacancies *
                                </label>

                                <input
                                    name="vacancy"
                                    type="number"
                                    min="1"
                                    placeholder="2"
                                    value={formData.vacancy}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Room Type
                                </label>

                                <select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleChange}
                                >
                                    <option value="Single">
                                        Single
                                    </option>

                                    <option value="Double">
                                        Double
                                    </option>

                                    <option value="Triple">
                                        Triple
                                    </option>

                                    <option value="Shared">
                                        Shared
                                    </option>

                                    <option value="Dormitory">
                                        Dormitory
                                    </option>
                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Suitable For
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="Any">
                                        Anyone
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>
                                </select>

                            </div>


                            <div className="form-field full">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    rows="5"
                                    placeholder="Describe the property, nearby places, rules, facilities..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </section>


                    {/* AMENITIES */}

                    <section className="form-section">

                        <div className="form-section-heading">

                            <span>03</span>

                            <div>
                                <h2>
                                    Amenities
                                </h2>

                                <p>
                                    Select facilities available
                                    at your property.
                                </p>
                            </div>

                        </div>


                        <div className="amenity-checkbox-grid">

                            <label>
                                <input
                                    type="checkbox"
                                    name="furnished"
                                    checked={
                                        formData.furnished
                                    }
                                    onChange={handleChange}
                                />

                                <span>
                                    🪑 Furnished
                                </span>
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    name="food"
                                    checked={
                                        formData.food
                                    }
                                    onChange={handleChange}
                                />

                                <span>
                                    🍱 Food Included
                                </span>
                            </label>


                            <label>
                                <input
                                    type="checkbox"
                                    name="ac"
                                    checked={
                                        formData.ac
                                    }
                                    onChange={handleChange}
                                />

                                <span>
                                    ❄️ Air Conditioning
                                </span>
                            </label>

                        </div>

                    </section>


                    {/* PHOTOS */}

                    <section className="form-section">

                        <div className="form-section-heading">

                            <span>04</span>

                            <div>
                                <h2>
                                    Property Photos
                                </h2>

                                <p>
                                    Upload clear photos of your property.
                                </p>
                            </div>

                        </div>


                        <div className="upload-box">

                            <div className="upload-icon">
                                📷
                            </div>

                            <h3>
                                Upload Property Images
                            </h3>

                            <p>
                                JPG, PNG or WEBP • Maximum 8 images
                            </p>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={
                                    handleImageChange
                                }
                            />

                            {images.length > 0 && (
                                <p className="selected-images">
                                    {images.length} image
                                    {images.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    selected
                                </p>
                            )}

                        </div>

                    </section>


                    {/* BUTTONS */}

                    <div className="form-submit">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    "/owner-dashboard"
                                )
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="publish-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Publishing..."
                                : "Publish Property →"}
                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
}

export default AddProperty;