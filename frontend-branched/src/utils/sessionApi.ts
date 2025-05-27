import { useClerkApiFetch } from "./clerkApiFetch";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useState, useEffect } from "react";

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  nodes: TreeNode[];
}

export interface TreeNode {
  id: string;
  chat_session_id: string;
  parent_id: string | null;
  user_message: string;
  llm_response: string;
  created_at: string;
  children: TreeNode[];
}

export interface ChatSessionRead {
  id: string;
  user_id: string;
  created_at: string;
  nodes: TreeNode[];
}

export function useSessionApi() {
  const clerkApiFetch = useClerkApiFetch();
  const { userId } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const lastFetchTimeRef = useRef<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [cachedSessions, setCachedSessions] = useState<ChatSession[] | null>(
    null
  );
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
    if (!userId) throw new Error("User not authenticated");

    setIsFetching(true);
    try {
      const response = await clerkApiFetch(`${API_BASE}/api/v1/sessions/user/`);

      if (response.status === 401) {
        // Handle unauthorized (likely invalid/expired token)
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch user sessions");
      }

      const data = await response.json();
      setCachedSessions(data);
      lastFetchTimeRef.current = Date.now();
      return data;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error; // Re-throw to be handled by the caller
    } finally {
      setIsFetching(false);
    }
  }, [userId, clerkApiFetch, API_BASE]);

  const getSessions = useCallback(
    async (force = false): Promise<ChatSession[]> => {
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
        fetchTimeoutRef.current = setTimeout(
          async () => {
            try {
              const sessions = await fetchSessions();
              resolve(sessions);
            } catch (error) {
              console.error("Error fetching sessions:", error);
              resolve(cachedSessions || []);
            }
          },
          force ? 0 : 100
        ); // No delay for forced refreshes
      });
    },
    [cachedSessions, fetchSessions, isFetching]
  );

  const getSession = useCallback(
    async (sessionId: string): Promise<ChatSession> => {
      // Try to find the session in cache first
      if (cachedSessions) {
        const cachedSession = cachedSessions.find(
          (session: ChatSession) => session.id === sessionId
        );
        if (cachedSession) {
          return cachedSession;
        }
      }

      // If not in cache, fetch it with JWT auth
      const response = await clerkApiFetch(
        `${API_BASE}/api/v1/sessions/${sessionId}`
      );

      if (response.status === 401) {
        // Handle unauthorized (likely invalid/expired token)
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to fetch session ${sessionId}`);
      }

      return response.json();
    },
    [API_BASE, clerkApiFetch, cachedSessions]
  );

  const createSession = async (
    initialMessage: string
  ): Promise<ChatSession> => {
    const response = await clerkApiFetch(`${API_BASE}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initial_message: initialMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create session");
    }

    return response.json();
  };

  const sendMessage = async (
    sessionId: string,
    branchId: string,
    message: string
  ): Promise<TreeNode> => {
    const response = await clerkApiFetch(
      `${API_BASE}/api/v1/sessions/${sessionId}/branches/${branchId}/msgs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: branchId,
          user_message: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to send message");
    }

    return response.json();
  };

  const createBranch = async (
    sessionId: string,
    parentId: string,
    message: string
  ): Promise<TreeNode> => {
    const response = await clerkApiFetch(
      `${API_BASE}/api/v1/sessions/${sessionId}/branches`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_id: parentId,
          user_message: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create branch");
    }

    return response.json();
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    const response = await clerkApiFetch(
      `${API_BASE}/api/v1/sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to delete session");
    }

    // Invalidate the cache
    if (cachedSessions) {
      setCachedSessions(
        cachedSessions.filter((session) => session.id !== sessionId)
      );
    }
  };

  const deleteBranch = async (
    sessionId: string,
    branchId: string
  ): Promise<void> => {
    const response = await clerkApiFetch(
      `${API_BASE}/api/v1/sessions/${sessionId}/branches/${branchId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to delete branch");
    }

    // Invalidate the cache for the session
    if (cachedSessions) {
      const updatedSessions = cachedSessions.map((session) => {
        if (session.id === sessionId) {
          // Create a deep copy to avoid mutating state directly
          const updatedNodes = removeNodeAndDescendants(
            session.nodes,
            branchId
          );
          return { ...session, nodes: updatedNodes };
        }
        return session;
      });
      setCachedSessions(updatedSessions);
    }
  };

  // Helper function to remove a node and its descendants from the tree
  const removeNodeAndDescendants = (
    nodes: TreeNode[],
    nodeId: string
  ): TreeNode[] => {
    return nodes
      .filter((node) => node.id !== nodeId) // Remove the target node
      .map((node) => ({
        ...node,
        children: node.children
          ? removeNodeAndDescendants(node.children, nodeId)
          : [], // Process children recursively
      }));
  };

  return {
    getSessions,
    getSession,
    createSession,
    sendMessage,
    createBranch,
    deleteSession,
    deleteBranch,
    refreshSessions: () => getSessions(true),
  };
}
