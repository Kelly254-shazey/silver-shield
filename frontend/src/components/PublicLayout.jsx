import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AssistantWidget from "./AssistantWidget";

function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
      <Footer />
      <AssistantWidget />
    </div>
  );
}

export default PublicLayout;
