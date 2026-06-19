import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "./api";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [programs, setPrograms] = useState([]);
  const [stories, setStories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [programsRes, storiesRes, eventsRes] = await Promise.all([
        apiFetch("/programs"),
        apiFetch("/stories"),
        apiFetch("/events"),
      ]);

      setPrograms(programsRes?.data ?? []);
      setStories(storiesRes?.data ?? []);
      setEvents(eventsRes?.data ?? []);
    } catch (err) {
      console.error("Failed to load content:", err);
      setError(err);
      setPrograms([]);
      setStories([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const getProgramBySlug = useCallback(
    (slug) => programs.find((p) => p.slug === slug),
    [programs]
  );

  const getProgramById = useCallback(
    (id) => programs.find((p) => String(p.id) === String(id)),
    [programs]
  );

  const getStoryBySlug = useCallback(
    (slug) => stories.find((s) => s.slug === slug),
    [stories]
  );

  const getEventById = useCallback(
    (id) => events.find((e) => String(e.id) === String(id)),
    [events]
  );

  return (
    <ContentContext.Provider
      value={{
        loading,
        error,
        programs,
        stories,
        events,
        refreshContent: loadContent,
        getProgramBySlug,
        getProgramById,
        getStoryBySlug,
        getEventById,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used inside <ContentProvider>");
  }
  return context;
}
