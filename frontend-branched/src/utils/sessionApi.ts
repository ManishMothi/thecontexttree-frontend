import { useClerkApiFetch } from "./clerkApiFetch";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";

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
  const [, setCachedSessions] = useState<Map<string, ChatSession>>(new Map());

  const getSessions = useCallback(async (): Promise<ChatSession[]> => {
    if (!userId) throw new Error("User not authenticated");

    try {
      const response = await clerkApiFetch(`${API_BASE}/api/v1/sessions/user/`);

      if (response.status === 401) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch user sessions");
      }

      const data = await response.json();

      // Update cache
      const newCache = new Map();
      data.forEach((session: ChatSession) => {
        newCache.set(session.id, session);
      });
      setCachedSessions(newCache);

      return data;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  }, [userId, clerkApiFetch, API_BASE]);

  const getSession = useCallback(
    async (sessionId: string): Promise<ChatSession> => {
      // Always fetch fresh data for individual sessions to ensure we have latest LLM responses
      const response = await clerkApiFetch(
        `${API_BASE}/api/v1/sessions/${sessionId}`
      );

      if (response.status === 401) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to fetch session ${sessionId}`);
      }

      const sessionData = await response.json();

      // Update cache
      setCachedSessions((prev) => {
        const newCache = new Map(prev);
        newCache.set(sessionId, sessionData);
        return newCache;
      });

      return sessionData;
    },
    [API_BASE, clerkApiFetch]
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

    const newSession = await response.json();

    // Update cache
    setCachedSessions((prev) => {
      const newCache = new Map(prev);
      newCache.set(newSession.id, newSession);
      return newCache;
    });

    return newSession;
  };

  const createBranch = async (
    sessionId: string,
    parentId: string,
    message: string,
    isNewBranch: boolean = false
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
          is_new_branch: isNewBranch,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = isNewBranch
        ? "Failed to create branch"
        : "Failed to send message";
      throw new Error(error.detail || errorMessage);
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

    // Remove from cache
    setCachedSessions((prev) => {
      const newCache = new Map(prev);
      newCache.delete(sessionId);
      return newCache;
    });
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
    setCachedSessions((prev) => {
      const newCache = new Map(prev);
      newCache.delete(sessionId);
      return newCache;
    });
  };

  return {
    getSessions,
    getSession,
    createSession,
    createBranch,
    deleteSession,
    deleteBranch,
    refreshSessions: () => getSessions(),
  };
}
