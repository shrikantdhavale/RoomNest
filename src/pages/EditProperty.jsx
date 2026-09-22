import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [propertyType, setPropertyType] = useState("ROOM");

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        price: "",
        vacancy: "",
        roomType: "Single",
        sharing: "Single",
        gender: "Any",
        description: "",
        furnished: false,
        food: false,
        ac: false,
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* =========================================================
       LOAD PROPERTY
    ========================================================= */

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            setLoading(true);
            setError("");

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                navigate("/login");
                return;
            }

            const { data: property, error: propertyError } = await supabase
                .from("properties")
                .select("*")
                .eq("id", id)
                .eq("owner_id", user.id)
                .single();

            if (propertyError) {
                throw propertyError;
            }

            setPropertyType(property.type);

            setFormData({
                title: property.title || "",
                location: property.location || "",
                price: property.price || "",
                vacancy: property.vacancy ?? "",
                roomType: property.room_type || "Single",
                sharing: property.sharing || "Single",
                gender: property.gender || "Any",
                description: property.description || "",
                furnished: property.furnished || false,
                food: property.food || false,
                ac: property.ac || false,
            });

            const { data: images, error: imageError } = await supabase
                .from("property_images")
                .select("*")
                .eq("property_id", property.id)
                .order("id", { ascending: true });

            if (imageError) {
                throw imageError;
            }

            setExistingImages(images || []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to load property.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       INPUT HANDLING
    ========================================================= */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
        setSuccess("");
    };

    /* =========================================================
       PROPERTY TYPE
    ========================================================= */

    const handlePropertyTypeChange = (type) => {
        setPropertyType(type);

        setFormData((previous) => ({
            ...previous,
            roomType: "Single",
            sharing: type === "PG" ? "Single" : "",
            gender: "Any",
            furnished: false,
            food: false,
            ac: false,
        }));

        setError("");
    };

    /* =========================================================
       ADD NEW PHOTOS
    ========================================================= */

    const handleNewImages = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (!selectedFiles.length) {
            return;
        }

        const totalImages =
            existingImages.length +
            newImages.length +
            selectedFiles.length;

        if (totalImages > 8) {
            setError("You can have a maximum of 8 photos.");
            e.target.value = "";
            return;
        }

        const validFiles = [];

        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                setError(`${file.name} is not an image.`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} is larger than 5MB.`);
                continue;
            }

            validFiles.push({
                file,
                preview: URL.createObjectURL(file),
            });
        }

        if (validFiles.length) {
            setNewImages((previous) => [
                ...previous,
                ...validFiles,
            ]);

            setError("");
        }

        e.target.value = "";
    };

    /* =========================================================
       REMOVE NEW PHOTO
    ========================================================= */

    const removeNewImage = (index) => {
        setNewImages((previous) => {
            const imageToRemove = previous[index];

            if (imageToRemove?.preview) {
                URL.revokeObjectURL(imageToRemove.preview);
            }

            return previous.filter((_, i) => i !== index);
        });
    };

    /* =========================================================
       DELETE EXISTING PHOTO
    ========================================================= */

    const deleteExistingImage = async (image) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this photo?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            /*
             * Delete database record first.
             */

            const { error: dbError } = await supabase
                .from("property_images")
                .delete()
                .eq("id", image.id);

            if (dbError) {
                throw dbError;
            }

            /*
             * Try to delete the actual Storage file.
             */

            try {
                const imageUrl = image.image_url;

                const marker = "/property-images/";

                if (imageUrl.includes(marker)) {
                    const filePath = decodeURIComponent(
                        imageUrl.split(marker)[1].split("?")[0]
                    );

                    await supabase.storage
                        .from("property-images")
                        .remove([filePath]);
                }
            } catch (storageError) {
                console.warn(
                    "Storage deletion warning:",
                    storageError
                );
            }

            setExistingImages((previous) =>
                previous.filter((item) => item.id !== image.id)
            );

            setSuccess("Photo deleted successfully.");
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Unable to delete the photo."
            );
        }
    };

    /* =========================================================
       SAVE PROPERTY
    ========================================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                navigate("/login");
                return;
            }

            if (!formData.title.trim()) {
                setError("Please enter a property title.");
                return;
            }

            if (!formData.location.trim()) {
                setError("Please enter the property location.");
                return;
            }

            if (!formData.price || Number(formData.price) <= 0) {
                setError("Please enter a valid monthly price.");
                return;
            }

            if (
                formData.vacancy === "" ||
                Number(formData.vacancy) < 0
            ) {
                setError("Please enter a valid vacancy.");
                return;
            }

            /* =================================================
               UPDATE PROPERTY
            ================================================= */

            const propertyData = {
                type: propertyType,
                title: formData.title.trim(),
                location: formData.location.trim(),
                price: Number(formData.price),
                vacancy: Number(formData.vacancy),

                room_type: formData.roomType || null,

                gender:
                    propertyType === "ROOM"
                        ? null
                        : formData.gender || "Any",

                sharing:
                    propertyType === "PG"
                        ? formData.sharing || null
                        : null,

                furnished: formData.furnished,

                food:
                    propertyType === "ROOM"
                        ? false
                        : formData.food,

                ac:
                    propertyType === "HOSTEL"
                        ? formData.ac
                        : false,

                description:
                    formData.description.trim() || null,
            };

            const { error: updateError } = await supabase
                .from("properties")
                .update(propertyData)
                .eq("id", id)
                .eq("owner_id", user.id);

            if (updateError) {
                throw updateError;
            }

            /* =================================================
               UPLOAD NEW PHOTOS
            ================================================= */

            for (const image of newImages) {
                const file = image.file;

                const extension =
                    file.name.split(".").pop() || "jpg";

                const fileName =
                    `${user.id}/${id}/` +
                    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } =
                    await supabase.storage
                        .from("property-images")
                        .upload(fileName, file, {
                            cacheControl: "3600",
                            upsert: false,
                        });

                if (uploadError) {
                    throw uploadError;
                }

                const {
                    data: publicUrlData,
                } = supabase.storage
                    .from("property-images")
                    .getPublicUrl(fileName);

                const publicUrl =
                    publicUrlData.publicUrl;

                const { error: imageDbError } =
                    await supabase
                        .from("property_images")
                        .insert({
                            property_id: Number(id),
                            image_url: publicUrl,
                        });

                if (imageDbError) {
                    throw imageDbError;
                }
            }

            /* =================================================
               CLEAN PREVIEWS
            ================================================= */

            newImages.forEach((image) => {
                if (image.preview) {
                    URL.revokeObjectURL(image.preview);
                }
            });

            setNewImages([]);

            setSuccess(
                "Property updated successfully."
            );

            await loadProperty();

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "Unable to update the property."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <main className="edit-property-page">
                <div className="edit-property-container">
                    <div className="edit-property-loading">
                        Loading property...
                    </div>
                </div>
            </main>
        );
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <main className="edit-property-page">
            <div className="edit-property-container">

                <div className="edit-property-header">
                    <div>
                        <span className="section-label">
                            ROOMNEST / EDIT PROPERTY
                        </span>

                        <h1>Edit Your Property</h1>

                        <p>
                            Update your property details,
                            features and photos.
                        </p>
                    </div>

                    <Link
                        to="/owner-dashboard"
                        className="secondary-button"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {error && (
                    <div className="form-message error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="form-message success-message">
                        {success}
                    </div>
                )}

                <form
                    className="edit-property-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        PROPERTY TYPE
                    ================================================= */}

                    <section className="edit-form-section">
                        <div className="edit-section-heading">
                            <span>01</span>

                            <div>
                                <h2>Property Type</h2>
                                <p>
                                    Choose what you are listing.
                                </p>
                            </div>
                        </div>

                        <div className="property-type-options">

                            {["ROOM", "PG", "HOSTEL"].map(
                                (type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={
                                            propertyType === type
                                                ? "property-type-option active"
                                                : "property-type-option"
                                        }
                                        onClick={() =>
                                            handlePropertyTypeChange(
                                                type
                                            )
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
                                )
                            )}

                        </div>
                    </section>

                    {/* =================================================
                        BASIC INFORMATION
                    ================================================= */}

                    <section className="edit-form-section">
                        <div className="edit-section-heading">
                            <span>02</span>

                            <div>
                                <h2>Basic Information</h2>
                                <p>
                                    Add the main information
                                    about your property.
                                </p>
                            </div>
                        </div>

                        <div className="edit-form-grid">

                            <div className="form-field full-width">
                                <label>
                                    Property Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Example: Spacious Single Room Near College"
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Example: Karve Nagar, Pune"
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    Monthly Rent
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="₹ 8000"
                                    min="1"
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    Vacancies
                                </label>

                                <input
                                    type="number"
                                    name="vacancy"
                                    value={formData.vacancy}
                                    onChange={handleChange}
                                    placeholder="1"
                                    min="0"
                                />
                            </div>

                        </div>
                    </section>

                    {/* =================================================
                        FEATURES
                    ================================================= */}

                    <section className="edit-form-section">
                        <div className="edit-section-heading">
                            <span>03</span>

                            <div>
                                <h2>Features</h2>
                                <p>
                                    Update the features of your
                                    property.
                                </p>
                            </div>
                        </div>

                        <div className="features-grid">

                            {/* ROOM TYPE */}

                            <div className="feature-box">
                                <div className="feature-box-header">
                                    <span className="feature-icon">
                                        🛏️
                                    </span>

                                    <div>
                                        <h3>Room Type</h3>
                                        <p>
                                            Select room type
                                        </p>
                                    </div>
                                </div>

                                <select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleChange}
                                >
                                    {propertyType === "ROOM" && (
                                        <>
                                            <option value="Single">
                                                Single
                                            </option>

                                            <option value="Double">
                                                Double
                                            </option>

                                            <option value="Shared">
                                                Shared
                                            </option>
                                        </>
                                    )}

                                    {propertyType === "PG" && (
                                        <>
                                            <option value="Single">
                                                Single
                                            </option>

                                            <option value="Double">
                                                Double
                                            </option>

                                            <option value="Triple">
                                                Triple
                                            </option>
                                        </>
                                    )}

                                    {propertyType === "HOSTEL" && (
                                        <>
                                            <option value="Single">
                                                Single
                                            </option>

                                            <option value="Double">
                                                Double
                                            </option>

                                            <option value="Dormitory">
                                                Dormitory
                                            </option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* PG SHARING */}

                            {propertyType === "PG" && (
                                <div className="feature-box">
                                    <div className="feature-box-header">
                                        <span className="feature-icon">
                                            👥
                                        </span>

                                        <div>
                                            <h3>Sharing</h3>
                                            <p>
                                                Select sharing
                                            </p>
                                        </div>
                                    </div>

                                    <select
                                        name="sharing"
                                        value={formData.sharing}
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

                                        <option value="4 Sharing">
                                            4 Sharing
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* GENDER */}

                            {propertyType !== "ROOM" && (
                                <div className="feature-box">
                                    <div className="feature-box-header">
                                        <span className="feature-icon">
                                            🚻
                                        </span>

                                        <div>
                                            <h3>Gender</h3>
                                            <p>
                                                Who can stay?
                                            </p>
                                        </div>
                                    </div>

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
                            )}

                            {/* FURNISHED */}

                           <label className="simple-feature">
    <input
        type="checkbox"
        name="furnished"
        checked={formData.furnished}
        onChange={handleChange}
    />
    <span>🪑 Furnished</span>
</label>
                            {/* FOOD */}

                            {propertyType !== "ROOM" && (
    <label className="simple-feature">
        <input
            type="checkbox"
            name="food"
            checked={formData.food}
            onChange={handleChange}
        />
        <span>🍱 Food Included</span>
    </label>
)}

                            {/* AC */}

                           {propertyType === "HOSTEL" && (
    <label className="simple-feature">
        <input
            type="checkbox"
            name="ac"
            checked={formData.ac}
            onChange={handleChange}
        />
        <span>❄️ AC Available</span>
    </label>
)}

                        </div>
                    </section>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <section className="edit-form-section">
                        <div className="edit-section-heading">
                            <span>04</span>

                            <div>
                                <h2>Description</h2>
                                <p>
                                    Tell users more about your
                                    property.
                                </p>
                            </div>
                        </div>

                        <div className="form-field">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your property..."
                                rows="6"
                            />
                        </div>
                    </section>

                    {/* =================================================
                        EXISTING PHOTOS
                    ================================================= */}

                    <section className="edit-form-section">
                        <div className="edit-section-heading">
                            <span>05</span>

                            <div>
                                <h2>Property Photos</h2>
                                <p>
                                    Delete old photos or add new
                                    ones.
                                </p>
                            </div>
                        </div>

                        {existingImages.length > 0 ? (
                            <div className="edit-property-images">

                                {existingImages.map((image) => (
                                    <div
                                        className="edit-property-image"
                                        key={image.id}
                                    >
                                        <img
                                            src={image.image_url}
                                            alt="Property"
                                        />

                                        <button
                                            type="button"
                                            className="delete-image-button"
                                            onClick={() =>
                                                deleteExistingImage(
                                                    image
                                                )
                                            }
                                            title="Delete photo"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}

                            </div>
                        ) : (
                            <div className="no-property-images">
                                No photos uploaded yet.
                            </div>
                        )}

                        {/* ADD PHOTOS */}

                        <label className="add-photo-box">
                            <span className="add-photo-icon">
                                +
                            </span>

                            <strong>
                                Add More Photos
                            </strong>

                            <small>
                                JPG, PNG or WEBP • Maximum 5MB
                                each
                            </small>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleNewImages}
                            />
                        </label>

                        {/* NEW PHOTO PREVIEW */}

                        {newImages.length > 0 && (
                            <div className="new-images-section">

                                <h3>
                                    New Photos
                                </h3>

                                <div className="edit-property-images">

                                    {newImages.map(
                                        (image, index) => (
                                            <div
                                                className="edit-property-image"
                                                key={`${image.file.name}-${index}`}
                                            >
                                                <img
                                                    src={image.preview}
                                                    alt="New property"
                                                />

                                                <button
                                                    type="button"
                                                    className="delete-image-button"
                                                    onClick={() =>
                                                        removeNewImage(
                                                            index
                                                        )
                                                    }
                                                    title="Remove photo"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )
                                    )}

                                </div>
                            </div>
                        )}

                        <div className="photo-limit-text">
                            {existingImages.length +
                                newImages.length}{" "}
                            / 8 photos
                        </div>
                    </section>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="edit-property-actions">

                        <Link
                            to="/owner-dashboard"
                            className="secondary-button"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}

export default EditProperty;