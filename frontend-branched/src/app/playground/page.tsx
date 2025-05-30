"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionApi } from "@/utils/sessionApi";
import { useAuth } from "@clerk/nextjs";
import { Send, Plus, RefreshCw, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
  buttonText?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

const MessageInput = ({
  onSubmit,
  isSubmitting,
  buttonText = "Send",
  placeholder = "Type your message...",
  className = "",
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSubmitting) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[40px] max-h-32 resize-none flex-1"
        rows={1}
      />
      <Button type="submit" disabled={!message.trim() || isSubmitting}>
        <Send className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </form>
  );
};

interface TreeNode {
  id: string;
  parent_id: string | null;
  user_message: string;
  llm_response: string;
  created_at: string;
  children: TreeNode[];
}

interface ChatSession {
  id: string;
  created_at: string;
  nodes: TreeNode[];
}

// Simple session summary for the sidebar
interface SessionSummary {
  id: string;
  created_at: string;
  first_message: string;
}

export default function PlaygroundPage() {
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>(
    []
  );
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingForResponse, setWaitingForResponse] = useState<string | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionApi = useSessionApi();
  const getSessions = sessionApi.getSessions;
  const getSession = sessionApi.getSession;
  const createNewSession = sessionApi.createSession;
  const createNewBranch = sessionApi.createBranch;
  const deleteSession = sessionApi.deleteSession;
  const deleteBranch = sessionApi.deleteBranch;

  // State for delete confirmation dialogs
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<{
    sessionId: string;
    branchId: string;
  } | null>(null);

  const { isSignedIn, signOut } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.nodes]);

  // Load session summaries on mount
  useEffect(() => {
    if (!isSignedIn) return;

    const loadSessionSummaries = async () => {
      try {
        setLoadingSessions(true);
        const sessions = await getSessions();
        // Convert to summaries for the sidebar
        const summaries = sessions.map((s) => ({
          id: s.id,
          created_at: s.created_at,
          first_message: s.nodes[0]?.user_message || "Empty session",
        }));
        setSessionSummaries(summaries);
      } catch (err) {
        console.error("Error loading sessions:", err);
        setError("Failed to load sessions. Please try again.");
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessionSummaries();
  }, [isSignedIn]); // Remove getSessions from dependencies

  const handleSessionSelect = async (sessionId: string) => {
    if (selectedSession?.id === sessionId) return; // Already selected

    try {
      setLoadingSession(true);
      setError(null);
      const session = await getSession(sessionId);
      setSelectedSession(session);
      setSelectedNode(null);
      setWaitingForResponse(null);
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load session. Please try again.");
    } finally {
      setLoadingSession(false);
    }
  };

  const handleCreateSession = () => {
    setShowNewSessionInput(true);
    setSelectedSession(null);
    setSelectedNode(null);
    setWaitingForResponse(null);
  };

  const handleNewSessionSubmit = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsCreatingSession(true);
      setError(null);

      const newSession = await createNewSession(message);

      // Add to summaries
      setSessionSummaries((prev) => [
        {
          id: newSession.id,
          created_at: newSession.created_at,
          first_message: message,
        },
        ...prev,
      ]);

      // Create an optimistic session with the user message
      const optimisticSession: ChatSession = {
        id: newSession.id,
        created_at: newSession.created_at,
        nodes: [
          {
            id: newSession.nodes[0]?.id || "temp-" + Date.now(),
            parent_id: null,
            user_message: message,
            llm_response: "", // Empty for now
            created_at: new Date().toISOString(),
            children: [],
          },
        ],
      };

      setSelectedSession(optimisticSession);
      setSelectedNode(optimisticSession.nodes[0]);
      setShowNewSessionInput(false);

      // Wait a moment for the LLM response to be generated
      setWaitingForResponse(newSession.nodes[0]?.id || null);

      // Poll for the complete session with LLM response
      let attempts = 0;
      const maxAttempts = 20;

      const checkForResponse = async () => {
        attempts++;
        try {
          const session = await getSession(newSession.id);
          const firstNode = session.nodes[0];

          if (firstNode && firstNode.llm_response) {
            // Response received
            setSelectedSession(session);
            setSelectedNode(firstNode);
            setWaitingForResponse(null);
          } else if (attempts < maxAttempts) {
            // Keep checking
            setTimeout(checkForResponse, 2000);
          } else {
            // Timeout - show what we have
            setSelectedSession(session);
            setSelectedNode(firstNode || null);
            setWaitingForResponse(null);
            setError("Response timeout. Please refresh to check for updates.");
          }
        } catch (err) {
          console.error("Error checking for response:", err);
          if (attempts < 3) {
            setTimeout(checkForResponse, 2000);
          } else {
            setWaitingForResponse(null);
            setError("Failed to get response. Please try again.");
          }
        }
      };

      // Start checking after a short delay
      setTimeout(checkForResponse, 2000);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session. Please try again.");
      setWaitingForResponse(null);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await deleteSession(sessionToDelete);
      setSessionSummaries((prev) =>
        prev.filter((s) => s.id !== sessionToDelete)
      );

      if (selectedSession?.id === sessionToDelete) {
        setSelectedSession(null);
        setSelectedNode(null);
        setWaitingForResponse(null);
      }

      setSessionToDelete(null);
    } catch (err) {
      console.error("Error deleting session:", err);
      setError(err instanceof Error ? err.message : "Failed to delete session");
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete || !selectedSession) return;

    try {
      const { sessionId, branchId } = branchToDelete;
      await deleteBranch(sessionId, branchId);

      // Refresh the session to get the updated tree
      const updatedSession = await getSession(sessionId);
      setSelectedSession(updatedSession);

      // Reset the selected node if it was deleted
      if (selectedNode?.id === branchId) {
        setSelectedNode(null);
      }

      setBranchToDelete(null);
    } catch (err) {
      console.error("Error deleting branch:", err);
      setError(err instanceof Error ? err.message : "Failed to delete branch");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedSession || !selectedNode) return;

    try {
      setIsSendingMessage(true);
      setError(null);

      const newNode = await createNewBranch(
        selectedSession.id,
        selectedNode.id,
        message,
        false
      );

      // Mark this node as waiting for response
      setWaitingForResponse(newNode.id);

      // Optimistically update the UI with the new node
      const updateNodeChildren = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              children: [
                ...(node.children || []),
                {
                  id: newNode.id,
                  parent_id: selectedNode.id,
                  user_message: message,
                  llm_response: "", // Empty for now
                  created_at: new Date().toISOString(),
                  children: [],
                },
              ],
            };
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateNodeChildren(node.children),
            };
          }
          return node;
        });
      };

      const optimisticSession = {
        ...selectedSession,
        nodes: updateNodeChildren(selectedSession.nodes),
      };

      setSelectedSession(optimisticSession);
      // Select the new node
      setSelectedNode({
        id: newNode.id,
        parent_id: selectedNode.id,
        user_message: message,
        llm_response: "",
        created_at: new Date().toISOString(),
        children: [],
      });

      // Poll for the response
      let attempts = 0;
      const maxAttempts = 20;

      const checkForResponse = async () => {
        attempts++;
        try {
          const updatedSession = await getSession(selectedSession.id);

          // Find the new node in the updated session
          const findNode = (nodes: TreeNode[]): TreeNode | null => {
            for (const node of nodes) {
              if (node.id === newNode.id) return node;
              if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
              }
            }
            return null;
          };

          const updatedNode = findNode(updatedSession.nodes);

          if (updatedNode && updatedNode.llm_response) {
            // Response received
            setSelectedSession(updatedSession);
            setSelectedNode(updatedNode);
            setWaitingForResponse(null);
          } else if (attempts < maxAttempts) {
            // Keep checking
            setTimeout(checkForResponse, 2000);
          } else {
            // Timeout
            setSelectedSession(updatedSession);
            if (updatedNode) setSelectedNode(updatedNode);
            setWaitingForResponse(null);
            setError("Response timeout. Please refresh to check for updates.");
          }
        } catch (err) {
          console.error("Error checking for response:", err);
          if (attempts < 3) {
            setTimeout(checkForResponse, 2000);
          } else {
            setWaitingForResponse(null);
            setError("Failed to get response. Please try again.");
          }
        }
      };

      // Start checking after a short delay
      setTimeout(checkForResponse, 2000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setWaitingForResponse(null);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});

  const renderMessageContent = useCallback(
    (content: string, maxLength = 200) => {
      const isLong = content.length > maxLength;
      const shouldTruncate = !expandedMessages[content];

      if (isLong && shouldTruncate) {
        return (
          <>
            {content.substring(0, maxLength).trim()}
            <span
              className="text-blue-500 cursor-pointer ml-1"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedMessages((prev) => ({ ...prev, [content]: true }));
              }}
            >
              ...show more
            </span>
          </>
        );
      } else if (isLong) {
        return (
          <>
            {content}
            <span
              className="text-blue-500 cursor-pointer block mt-1 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedMessages((prev) => ({ ...prev, [content]: false }));
              }}
            >
              show less
            </span>
          </>
        );
      }
      return content;
    },
    [expandedMessages]
  );

  const renderNode = (node: TreeNode, level = 0) => {
    const isSelected = selectedNode?.id === node.id;
    const isWaitingForResponse = waitingForResponse === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const marginLeft = level * 16;

    return (
      <div
        key={node.id}
        className="mb-3"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        <div
          className={`p-4 rounded-lg cursor-pointer transition-colors border ${
            isSelected
              ? "bg-blue-50 border-blue-200"
              : "border-gray-100 hover:bg-gray-50"
          }`}
          onClick={() => setSelectedNode(node)}
        >
          <div className="font-medium text-gray-900 mb-2">
            {node.user_message.length > 100
              ? renderMessageContent(node.user_message, 100)
              : node.user_message}
          </div>
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
            {isWaitingForResponse && !node.llm_response ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-gray-500">Generating response...</span>
              </div>
            ) : node.llm_response ? (
              renderMessageContent(node.llm_response, 200)
            ) : (
              <span className="text-gray-400 italic">No response</span>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {new Date(node.created_at).toLocaleString()}
              </span>
              {level > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBranchToDelete({
                      sessionId: selectedSession!.id,
                      branchId: node.id,
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  title="Delete branch"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {hasChildren && (
          <div className="mt-3 border-l-2 border-gray-200 pl-3">
            {node.children?.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Please sign in to continue</h1>
        <p className="text-gray-600 mb-6">
          You need to be signed in to access the playground.
        </p>
        <Button onClick={() => signOut()}>Sign In</Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Chat Sessions Playground</h1>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 flex justify-between items-center"
              role="alert"
            >
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSession}
              disabled={isCreatingSession || showNewSessionInput}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
            <Card>
              <CardContent className="p-0">
                {loadingSessions ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading...
                  </div>
                ) : sessionSummaries.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No sessions found
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                    {sessionSummaries.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 border-b cursor-pointer transition-colors ${
                          selectedSession?.id === session.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleSessionSelect(session.id)}
                      >
                        <div className="font-medium text-sm truncate">
                          {session.first_message.substring(0, 80)}...
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(session.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
            {showNewSessionInput ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  Start a New Session
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your first message to begin the conversation
                </p>
                <div className="w-full max-w-2xl">
                  <MessageInput
                    onSubmit={handleNewSessionSubmit}
                    isSubmitting={isCreatingSession}
                    buttonText="Start Session"
                    placeholder="Type your message here..."
                  />
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewSessionInput(false)}
                      disabled={isCreatingSession}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedSession ? (
              <>
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {selectedSession.nodes[0]?.user_message?.substring(
                          0,
                          40
                        ) || "New Session"}
                        ...
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              setLoadingSession(true);
                              const updated = await getSession(
                                selectedSession.id
                              );
                              setSelectedSession(updated);
                            } catch (err) {
                              console.error("Error refreshing:", err);
                              setError("Failed to refresh. Please try again.");
                            } finally {
                              setLoadingSession(false);
                            }
                          }}
                          disabled={loadingSession || !!waitingForResponse}
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-1 ${
                              loadingSession || !!waitingForResponse
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                          Refresh
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setSessionToDelete(selectedSession.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Conversation
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-4">
                    {loadingSession ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-pulse text-gray-500">
                          Loading conversation...
                        </div>
                      </div>
                    ) : selectedSession.nodes.length > 0 ? (
                      <div className="space-y-4">
                        {selectedSession.nodes
                          .filter((node) => !node.parent_id)
                          .map((node) => renderNode(node, 0))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>
                          No messages in this session yet. Send a message to get
                          started.
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <div className="p-4 border-t">
                    {selectedNode ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h3 className="font-medium mb-2">
                            Continue from selected node
                          </h3>
                          <MessageInput
                            onSubmit={handleSendMessage}
                            isSubmitting={
                              isSendingMessage || !!waitingForResponse
                            }
                            placeholder="Type your message..."
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            This will create a new message as a child of the
                            selected node.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        Select a conversation node to continue the conversation.
                      </div>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">
                    No session selected
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select an existing session or create a new one to get
                    started.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleCreateSession}
                    disabled={showNewSessionInput}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Session
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Session Confirmation Dialog */}
      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all its
              branches. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Branch Confirmation Dialog */}
      <AlertDialog
        open={!!branchToDelete}
        onOpenChange={(open) => !open && setBranchToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this branch and all its replies. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
