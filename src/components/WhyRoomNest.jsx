function WhyRoomNest() {

    const features = [
        {
            number: "01",
            icon: "⌕",
            title: "Search smarter",
            description:
                "Find rooms, PGs and hostels using location, budget and property preferences."
        },

        {
            number: "02",
            icon: "✓",
            title: "Real listings",
            description:
                "Get clear property information including rent, vacancies, amenities and contact details."
        },

        {
            number: "03",
            icon: "⌖",
            title: "Local first",
            description:
                "Start with Karve Nagar and discover places close to where you actually want to live."
        }
    ];

    return (
        <section className="why-section">

            <div className="section-container">

                <div className="why-header">

                    <span className="section-label">
                        WHY ROOMNEST
                    </span>

                    <h2>
                        Finding a place
                        <br />
                        shouldn't be <span>complicated.</span>
                    </h2>

                </div>


                <div className="features-grid">

                    {features.map((feature) => (

                        <div
                            className="feature-card"
                            key={feature.number}
                        >

                            <span className="feature-number">
                                {feature.number}
                            </span>

                            <div className="feature-icon">
                                {feature.icon}
                            </div>

                            <h3>
                                {feature.title}
                            </h3>

                            <p>
                                {feature.description}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default WhyRoomNest;