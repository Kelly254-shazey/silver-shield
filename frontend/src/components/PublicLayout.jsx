import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import AssistantWidget from "./AssistantWidget";

function PublicLayout() {
  return (
    <Fragment>
      <div className="app-shell">
        <Navbar />
        <main className="page-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
      {/* Fixed-position widget — outside document flow, semantically grouped */}
      <AssistantWidget />
    </Fragment>
  );
}

export default PublicLayout;
