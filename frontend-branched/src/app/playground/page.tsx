"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionApi } from "@/utils/sessionApi";
import { useAuth } from "@clerk/nextjs";
import {
  Send,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  MoreVertical,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function PlaygroundPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    getSessions,
    getSession,
    createSession: createNewSession,
    createBranch: createNewBranch,
    deleteSession,
    deleteBranch,
  } = useSessionApi();
  
  // State for delete confirmation dialogs
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<{sessionId: string, branchId: string} | null>(null);

  const { isSignedIn, signOut } = useAuth();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.nodes]);

  const loadSessions = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const sessionsData = await getSessions();
      setSessions(sessionsData);

      // Only update selected session if we don't have one or if the current one doesn't exist anymore
      if (sessionsData.length > 0) {
        const shouldUpdateSession =
          !selectedSession ||
          !sessionsData.some((s) => s.id === selectedSession.id);

        if (shouldUpdateSession) {
          const session = await getSession(sessionsData[0].id);
          setSelectedSession(session);
        }
      } else {
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getSessions, getSession, selectedSession]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSessionSelect = async (sessionId: string) => {
    try {
      setLoading(true);
      const session = await getSession(sessionId);
      setSelectedSession(session);
      setSelectedNode(null);
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = () => {
    setShowNewSessionInput(true);
    setSelectedSession(null);
    setSelectedNode(null);
  };

  const handleNewSessionSubmit = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsCreatingSession(true);
      setError(null);

      const newSession = await createNewSession(message);
      // Update sessions list and select the new session
      const updatedSessions = await getSessions();
      setSessions(updatedSessions);

      // Get the full session data and update the selected session
      const session = await getSession(newSession.id);
      setSelectedSession(session);
      setSelectedNode(null);
      setShowNewSessionInput(false);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      await deleteSession(sessionToDelete);
      const updatedSessions = sessions.filter(s => s.id !== sessionToDelete);
      setSessions(updatedSessions);
      
      if (selectedSession?.id === sessionToDelete) {
        setSelectedSession(updatedSessions[0] || null);
        setSelectedNode(null);
      }
      
      setSessionToDelete(null);
    } catch (err) {
      console.error("Error deleting session:", err);
      setError(err instanceof Error ? err.message : "Failed to delete session");
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    
    try {
      const { sessionId, branchId } = branchToDelete;
      await deleteBranch(sessionId, branchId);
      
      // Refresh the session to get the updated tree
      const updatedSession = await getSession(sessionId);
      setSelectedSession(updatedSession);
      
      // Update the sessions list
      const updatedSessions = sessions.map(s => 
        s.id === sessionId ? updatedSession : s
      );
      setSessions(updatedSessions);
      
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
        false // isNewBranch is false to create a child node
      );

      // Immediately update the UI optimistically
      const updatedSession = await getSession(selectedSession.id);
      setSelectedSession(updatedSession);

      // Update sessions list to reflect the change
      const updatedSessions = sessions.map((s) =>
        s.id === selectedSession.id ? updatedSession : s
      );
      setSessions(updatedSessions);

      // Find and set the new node as selected
      const findAndSetNode = (nodes: TreeNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === selectedNode.id) {
            // Find the new node in the children
            const newChild = node.children.find(
              (child) => child.id === newNode.id
            );
            if (newChild) {
              setSelectedNode(newChild);
              return true;
            }
          }
          if (node.children && node.children.length > 0) {
            if (findAndSetNode(node.children)) {
              return true;
            }
          }
        }
        return false;
      };

      findAndSetNode(updatedSession.nodes);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      // Re-fetch to ensure we're in sync
      if (selectedSession) {
        const refreshedSession = await getSession(selectedSession.id);
        setSelectedSession(refreshedSession);
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

  const toggleExpand = useCallback((content: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [content]: !prev[content]
    }));
  }, []);

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
    const hasChildren = node.children && node.children.length > 0;
    const marginLeft = level * 16; // Convert level to pixels for consistent spacing
    const isLongMessage =
      node.llm_response.length > 200 || node.user_message.length > 100;

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
            {renderMessageContent(node.llm_response, 200)}
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
                      branchId: node.id
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  title="Delete branch"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
            {isLongMessage && (
              <button
                className="text-xs text-blue-500 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.llm_response);
                }}
              >
                {expandedMessages[node.llm_response] ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </button>
            )}
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
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-700 hover:text-red-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
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
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!selectedSession}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => selectedSession && setSessionToDelete(selectedSession.id)}
                >
                  Delete conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No sessions found
                </div>
              ) : (
                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  {sessions.map((session) => (
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
                        {session.nodes[0]?.user_message?.substring(0, 80) ||
                          "Session"}
                        ...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(session.created_at).toLocaleString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
                        onClick={() => handleSessionSelect(selectedSession.id)}
                        disabled={loading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-1 ${
                            loading ? "animate-spin" : ""
                          }`}
                        />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-pulse text-gray-500">
                        Loading conversation...
                      </div>
                    </div>
                  ) : selectedSession.nodes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedSession.nodes
                        .filter((node) => !node.parent_id) // Only render root nodes
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
                          isSubmitting={isSendingMessage}
                          placeholder="Type your message..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          This will create a new message as a child of the selected node.
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
                  Select an existing session or create a new one to get started.
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => getSessions(true)}
                    className="h-8 w-8 p-0"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateSession}
                    disabled={showNewSessionInput}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>

    {/* Delete Session Confirmation Dialog */}
    <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the conversation and all its branches. This action cannot be undone.
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
    <AlertDialog open={!!branchToDelete} onOpenChange={(open) => !open && setBranchToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this branch and all its replies. This action cannot be undone.
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
