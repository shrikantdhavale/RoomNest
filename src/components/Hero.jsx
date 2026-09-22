function Hero() {
    return (
        <section className="hero-section">

            <div className="hero-background-shape shape-one"></div>
            <div className="hero-background-shape shape-two"></div>

            <div className="hero-container">

                <div className="hero-content">

                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        Now exploring Karve Nagar, Pune
                    </div>

                    <h1>
                        Find a place
                        <br />
                        you'll call <span>home.</span>
                    </h1>

                    <p>
                        Discover rooms, PGs and hostels
                        that match your budget, lifestyle
                        and location.
                    </p>

                    <div className="hero-search">

                        <div className="search-location">
                            <span className="search-icon">⌖</span>

                            <div>
                                <small>LOCATION</small>
                                <strong>Karve Nagar, Pune</strong>
                            </div>
                        </div>

                        <div className="search-divider"></div>

                        <div className="search-property">

                            <span className="search-icon">⌂</span>

                            <div>
                                <small>LOOKING FOR</small>

                                <select defaultValue="">
                                    <option value="" disabled>
                                        Select property type
                                    </option>

                                    <option value="room">
                                        Room
                                    </option>

                                    <option value="pg">
                                        PG
                                    </option>

                                    <option value="hostel">
                                        Hostel
                                    </option>
                                </select>

                            </div>

                        </div>

                        <button className="search-button">
                            Search
                        </button>

                    </div>

                    <div className="hero-trust">

                        <div className="avatars">
                            <span>S</span>
                            <span>R</span>
                            <span>A</span>
                            <span>+</span>
                        </div>

                        <div>
                            <strong>500+ seekers</strong>
                            <p>are looking for their next stay</p>
                        </div>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-card-main">

                        <img
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
                            alt="Modern room"
                        />

                        <div className="hero-card-overlay">

                            <div>
                                <span>Featured Stay</span>
                                <strong>Modern Private Room</strong>
                                <small>📍 Karve Nagar</small>
                            </div>

                            <div className="hero-price">
                                <strong>₹8,000</strong>
                                <span>/ month</span>
                            </div>

                        </div>

                    </div>

                    <div className="floating-card availability-card">

                        <div className="floating-icon">
                            ✓
                        </div>

                        <div>
                            <strong>Available now</strong>
                            <span>1 room left</span>
                        </div>

                    </div>

                    <div className="floating-card rating-card">

                        {/* <strong>4.8</strong>
                        <span>★</span>
                        <small>Guest rating</small> */}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Hero;