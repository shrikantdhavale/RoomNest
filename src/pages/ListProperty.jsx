import { Link } from "react-router-dom";

function ListProperty() {
    return (
        <main className="list-property-page">

            <div className="list-property-container">

                <span className="section-label">
                    ROOMNEST / LIST YOUR PROPERTY
                </span>

                <h1>
                    Want to list your property?
                </h1>

                <p>
                    Create an Owner or Broker account to publish
                    your rooms, PGs and hostels on RoomNest.
                </p>


                <div className="list-property-options">

                    {/* OWNER */}

                    <Link
                        to="/register?type=owner"
                        className="list-property-option"
                    >
                        <span>🏠</span>

                        <h2>
                            I'm a Property Owner
                        </h2>

                        <p>
                            List your own rooms, PGs or hostels
                            and manage your listings.
                        </p>

                        <strong>
                            Register as Owner →
                        </strong>
                    </Link>


                    {/* BROKER */}

                    <Link
                        to="/register?type=broker"
                        className="list-property-option"
                    >
                        <span>🏢</span>

                        <h2>
                            I'm a Broker
                        </h2>

                        <p>
                            List properties on behalf of property
                            owners and manage your listings.
                        </p>

                        <strong>
                            Register as Broker →
                        </strong>
                    </Link>

                </div>


                <div className="list-property-login">

                    <span>
                        Already have an Owner or Broker account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>

            </div>

        </main>
    );
}

export default ListProperty;