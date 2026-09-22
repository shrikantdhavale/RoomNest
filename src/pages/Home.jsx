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
                            description="Find rooms that fit your budget and lifestyle."
                            count="120"
                            className="rooms-category"
                            link="/rooms"
                        />

                        <CategoryCard
                            icon="🏢"
                            title="PGs"
                            description="Comfortable PG accommodation for students and professionals."
                            count="85"
                            className="pg-category"
                            link="/pg"
                        />

                       <CategoryCard
                            icon="🛏️"
                            title="Hostels"
                            description="Affordable hostel accommodation across Pune."
                            count="60"
                            className="hostel-category"
                            link="/hostels"
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