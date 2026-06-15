import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import React, { useEffect } from "react";
import PublicLayout from "./components/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import LoadingSkeleton from "./components/LoadingSkeleton";
import AssistantWidget from "./components/AssistantWidget";

// Lazy load public pages
const HomePage = React.lazy(() => import("./pages/HomePage"));
const ProgramsPage = React.lazy(() => import("./pages/ProgramsPage"));
const ProgramDetailsPage = React.lazy(() => import("./pages/ProgramDetailsPage"));
const StoriesPage = React.lazy(() => import("./pages/StoriesPage"));
const StoryDetailsPage = React.lazy(() => import("./pages/StoryDetailsPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogDetailsPage = React.lazy(() => import("./pages/BlogDetailsPage"));
const DonatePage = React.lazy(() => import("./pages/DonatePage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const TeamPage = React.lazy(() => import("./pages/TeamPage"));
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));
const VolunteerPage = React.lazy(() => import("./pages/VolunteerPage"));

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
  useEffect(() => {
    // This effect runs once on mount to ensure the widget is always present
    // and doesn't get unmounted/remounted with Suspense boundaries.
    // No specific logic needed here, just its placement in the DOM.
  }, []);

  return (
    <>
      <Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:id" element={<ProgramDetailsPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/stories/:id" element={<StoryDetailsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/volunteer" element={<VolunteerPage />} />
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
                    "parentId",
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
              path="blog"
              element={
                <AdminEntityPage
                  title="Blog"
                  endpoint="/blog"
                  fields={[
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "coverImage",
                    "category",
                    "author",
                    "status",
                  ]}
                />
              }
            />
            <Route
              path="sub-programs"
              element={
                <AdminEntityPage
                  title="Sub-Programs"
                  endpoint="/sub-programs"
                  fields={[
                    "parentId",
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
            <Route
              path="volunteers"
              element={
                <AdminEntityPage
                  title="Volunteer Applications"
                  endpoint="/volunteers"
                  fields={[
                    "fullName",
                    "email",
                    "phone",
                    "location",
                    "skills",
                    "interests",
                    "availability",
                    "message",
                  ]}
                />
              }
            />
            <Route path="donations" element={<AdminDonationsPage />} />
            <Route path="inbox" element={<AdminInboxPage />} />
            <Route path="docs" element={<AdminDocsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
       <AssistantWidget />
      </Suspense>
    </>
  );
}

export default App;
