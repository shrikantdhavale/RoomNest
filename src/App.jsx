import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import PG from "./pages/PG";
import Hostels from "./pages/Hostels";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddProperty from "./pages/AddProperty";
import Account from "./pages/Account";
import ListProperty from "./pages/ListProperty";
import EditProperty from "./pages/EditProperty";



function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <Routes>
                <Route
                    path="/property/:id"
                    element={<PropertyDetails />}
                />

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/rooms"
                    element={<Rooms />}
                />

                <Route
                    path="/pg"
                    element={<PG />}
                />

                <Route
                    path="/hostels"
                    element={<Hostels />}
                />
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/owner-dashboard"
                    element={<OwnerDashboard />}
                />

                <Route
                    path="/add-property"
                    element={<AddProperty />}
                />
                                <Route
                    path="/account"
                    element={<Account />}
                />
                                <Route
                    path="/list-property"
                    element={<ListProperty />}
                />
                <Route
    path="/edit-property/:id"
    element={<EditProperty />}
/>

            </Routes>

            <Footer />

        </BrowserRouter>
    );
}

export default App;