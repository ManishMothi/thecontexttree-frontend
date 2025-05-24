import { useClerkApiFetch } from "./clerkApiFetch";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useState, useEffect } from "react";

interface ChatSession {
  id: string;
  user_id: string;
  created_at: string;
  nodes: TreeNode[];
}

interface TreeNode {
  id: string;
  chat_session_id: string;
  parent_id: string | null;
  user_message: string;
  llm_response: string;
  created_at: string;
  children: TreeNode[];
}

export function useSessionApi() {
  const clerkApiFetch = useClerkApiFetch();
  const { userId } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const lastFetchTimeRef = useRef<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [cachedSessions, setCachedSessions] = useState<ChatSession[] | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const fetchSessions = useCallback(async (): Promise<ChatSession[]> => {
    if (!userId) throw new Error('User not authenticated');
    
    setIsFetching(true);
    try {
      const response = await clerkApiFetch(`${API_BASE}/api/v1/sessions/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user sessions');
      }
      const data = await response.json();
      setCachedSessions(data);
      lastFetchTimeRef.current = Date.now();
      return data;
    } finally {
      setIsFetching(false);
    }
  }, [userId, clerkApiFetch, API_BASE]);

  const getSessions = useCallback(async (force = false): Promise<ChatSession[]> => {
    // Return cached data if available and not forcing refresh
    if (cachedSessions && !force) {
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      // If last fetch was less than 5 seconds ago, return cached data
      if (timeSinceLastFetch < 5000) {
        return cachedSessions;
      }
    }

    // If we're already fetching, wait for the current fetch to complete
    if (isFetching) {
      return new Promise((resolve) => {
        const check = () => {
          if (!isFetching) {
            resolve(cachedSessions || []);
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    // Clear any pending timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // If we need to fetch, debounce to avoid rapid successive calls
    return new Promise((resolve) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          const sessions = await fetchSessions();
          resolve(sessions);
        } catch (error) {
          console.error('Error fetching sessions:', error);
          resolve(cachedSessions || []);
        }
      }, force ? 0 : 100); // No delay for forced refreshes
    });
  }, [cachedSessions, fetchSessions, isFetching]);

  const getSession = useCallback(async (sessionId: string): Promise<ChatSession> => {
    // Try to find the session in cache first
    if (cachedSessions) {
      const cachedSession = cachedSessions.find((session: ChatSession) => session.id === sessionId);
      if (cachedSession) {
        return cachedSession;
      }
    }

    // If not in cache, fetch it
    const response = await clerkApiFetch(`${API_BASE}/api/v1/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch session ${sessionId}`);
    }
    return response.json();
  }, [API_BASE, clerkApiFetch, cachedSessions]);

  return {
    getSessions,
    getSession,
    refreshSessions: () => getSessions(true),
  };
}
