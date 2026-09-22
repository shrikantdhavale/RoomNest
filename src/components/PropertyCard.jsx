import { Link } from "react-router-dom";

function PropertyCard({
    id,
    image,
    type,
    title,
    location,
    price,
    vacancy,
    rating,
    tags
}) {
    return (
        <Link
            to={`/property/${id}`}
            className="property-card-link"
        >

            <article className="property-card">

                <div className="property-image">

                    <img
                        src={image}
                        alt={title}
                    />

                    <span className="property-type">
                        {type}
                    </span>

                    <button
                        className="favorite-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        ♡
                    </button>

                </div>


                <div className="property-content">

                    <div className="property-title-row">

                        <h3>
                            {title}
                        </h3>

                        <span className="rating">
                            ★ {rating}
                        </span>

                    </div>


                    <p className="property-location">
                        📍 {location}
                    </p>


                    <div className="property-tags">

                        {tags.map((tag, index) => (
                            <span key={index}>
                                {tag}
                            </span>
                        ))}

                    </div>


                    <div className="property-bottom">

                        <div className="property-price">

                            <strong>
                                ₹{price.toLocaleString()}
                            </strong>

                            <span>
                                /month
                            </span>

                        </div>

                        <span className="vacancy">
                            {vacancy} available
                        </span>

                    </div>

                </div>

            </article>

        </Link>
    );
}

export default PropertyCard;