import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PublicLayout() {
  return (
    <Fragment>
      <div className="app-shell">
        <Navbar />
        <main className="page-content"> {/* PageTransition is now handled by each page */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}

export default PublicLayout;
