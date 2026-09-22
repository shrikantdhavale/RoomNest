import PropertyCard from "./PropertyCard";
import properties from "../data/properties";

function PropertySection() {

    return (
        <section className="properties-section">

            <div className="section-container">

                <div className="section-header">

                    <div>
                        <span className="section-label">
                            POPULAR STAYS
                        </span>

                        <h2>
                            Places people are
                            <span> looking at.</span>
                        </h2>
                    </div>

                    <button className="view-all-button">
                        View all properties →
                    </button>

                </div>


                <div className="property-grid">

                    {properties.map((property) => (

                        <PropertyCard
                            key={property.id}
                            {...property}
                        />

                    ))}

                </div>

            </div>

        </section>
    );
}

export default PropertySection;