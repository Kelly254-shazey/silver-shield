import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import React from "react";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import LoadingSkeleton from "./components/LoadingSkeleton";

// Lazy load public pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const ProgramsPage = React.lazy(() => import("./pages/ProgramsPage"));
const ProgramDetailsPage = React.lazy(() => import("./pages/ProgramDetailsPage"));
const ImpactPage = React.lazy(() => import("./pages/ImpactPage"));
const StoriesPage = React.lazy(() => import("./pages/StoriesPage"));
const StoryDetailsPage = React.lazy(() => import("./pages/StoryDetailsPage"));
const DonatePage = React.lazy(() => import("./pages/DonatePage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const TeamPage = React.lazy(() => import("./pages/TeamPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));

// Lazy load admin pages
const AdminLoginPage = React.lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = React.lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminEntityPage = React.lazy(() => import("./pages/admin/AdminEntityPage"));
const AdminInboxPage = React.lazy(() => import("./pages/admin/AdminInboxPage"));
const AdminDocsPage = React.lazy(() => import("./pages/admin/AdminDocsPage"));
const AdminDonationsPage = React.lazy(() => import("./pages/admin/AdminDonationsPage"));
const AdminTeamPage = React.lazy(() => import("./pages/admin/AdminTeamPage"));
const AdminAboutPage = React.lazy(() => import("./pages/admin/AdminAboutPage"));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/:id" element={<ProgramDetailsPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryDetailsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route
            path="programs"
            element={
              <AdminEntityPage
                title="Programs"
                endpoint="/programs"
                fields={[
                  "title",
                  "slug",
                  "summary",
                  "description",
                  "category",
                  "heroImage",
                  "galleryImages",
                  "goalAmount",
                  "raisedAmount",
                  "location",
                  "status",
                ]}
              />
            }
          />
          <Route
            path="stories"
            element={
              <AdminEntityPage
                title="Stories"
                endpoint="/stories"
                fields={[
                  "title",
                  "excerpt",
                  "content",
                  "coverImage",
                  "category",
                  "programSlug",
                  "author",
                  "tags",
                  "status",
                ]}
              />
            }
          />
          <Route
            path="impact"
            element={
              <AdminEntityPage
                title="Impact Stats"
                endpoint="/impact/stats"
                fields={["metricKey", "label", "value", "unit", "trend", "icon", "reportUrl"]}
              />
            }
          />
          <Route
            path="partners"
            element={
              <AdminEntityPage
                title="Partners"
                endpoint="/partners"
                fields={["name", "logoUrl", "websiteUrl", "orderIndex"]}
              />
            }
          />
          <Route path="about" element={<AdminAboutPage />} />
          <Route
            path="events"
            element={
              <AdminEntityPage
                title="Events"
                endpoint="/events"
                fields={[
                  "title",
                  "description",
                  "eventDate",
                  "location",
                  "programSlug",
                  "coverImage",
                  "videoUrl",
                  "registrationUrl",
                  "status",
                ]}
              />
            }
          />
          <Route path="team" element={<AdminTeamPage />} />
          <Route path="donations" element={<AdminDonationsPage />} />
          <Route path="inbox" element={<AdminInboxPage />} />
          <Route path="docs" element={<AdminDocsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
