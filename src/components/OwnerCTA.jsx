import { Link } from "react-router-dom";

function OwnerCTA() {

    return (
        <section className="owner-section">

            <div className="owner-container">

                <div className="owner-content">

                    <span className="section-label">
                        FOR OWNERS & BROKERS
                    </span>

                    <h2>
                        Have a room
                        <br />
                        to <span>rent?</span>
                    </h2>

                    <p>
                        Reach people actively looking for
                        rooms, PGs and hostels in Pune.
                    </p>

                   <Link
    to="/list-property"
    className="owner-cta-button"
>
    + List Your Property
</Link>

                </div>


                <div className="owner-stat">

                    <strong>FREE</strong>

                    <span>
                        Listing for your
                        first property
                    </span>

                </div>

            </div>

        </section>
    );
}

export default OwnerCTA;