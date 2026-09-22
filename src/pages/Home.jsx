import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";
import PropertySection from "../components/PropertySection";
import WhyRoomNest from "../components/WhyRoomNest";
import OwnerCTA from "../components/OwnerCTA";

function Home() {

    return (
        <>

            <Hero />

            <section className="categories-section">

                <div className="section-container">

                    <div className="section-header">

                        <div>
                            <span className="section-label">
                                EXPLORE STAYS
                            </span>

                            <h2>
                                What are you
                                <span> looking for?</span>
                            </h2>
                        </div>

                    </div>

                    <div className="category-grid">

                        <CategoryCard
                            icon="🏠"
                            title="Rooms"
                            count="120+"
                            description="Private and shared rooms for students and working professionals."
                            className="rooms-card"
                        />

                        <CategoryCard
                            icon="🛏️"
                            title="PGs"
                            count="250+"
                            description="Comfortable PG accommodations with flexible sharing options."
                            className="pg-card"
                        />

                        <CategoryCard
                            icon="🏨"
                            title="Hostels"
                            count="80+"
                            description="Affordable hostels with essential facilities and security."
                            className="hostel-card"
                        />

                    </div>

                </div>

            </section>

            <PropertySection />

            <WhyRoomNest />

            <OwnerCTA />

        </>
    );
}

export default Home;