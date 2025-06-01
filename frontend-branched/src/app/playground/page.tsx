"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionApi } from "@/utils/sessionApi";
import { useAuth } from "@clerk/nextjs";
import { Send, Plus, RefreshCw, Trash2, X, MessageSquare } from "lucide-react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

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

  const handleSubmit = () => {
    if (message.trim() && !isSubmitting) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[40px] max-h-32 resize-none flex-1"
        rows={1}
      />
      <Button onClick={handleSubmit} disabled={!message.trim() || isSubmitting}>
        <Send className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
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

interface SessionSummary {
  id: string;
  created_at: string;
  first_message: string;
}

// Custom node component for the tree
const ChatNode = ({ data }: { data: any }) => {
  const isSelected = data.isSelected;
  const isWaiting = data.isWaiting;
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 shadow-xl scale-105"
          : "border-gray-200 hover:border-gray-300"
      } ${data.onClick ? "cursor-pointer" : ""}`}
      onClick={data.onClick}
      style={{ width: "280px" }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-gray-400 border-2 border-white"
        style={{ top: "-6px" }}
      />

      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              User
            </div>
          </div>
          <div className="font-medium text-sm text-gray-900 bg-blue-50 p-2 rounded-lg">
            {truncateText(data.userMessage, 80)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              AI
            </div>
          </div>
          <div className="text-sm text-gray-700 bg-green-50 p-2 rounded-lg">
            {isWaiting ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin text-green-600" />
                <span className="text-green-600">Generating...</span>
              </div>
            ) : data.llmResponse ? (
              truncateText(data.llmResponse, 120)
            ) : (
              <span className="text-gray-400 italic">No response</span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {new Date(data.createdAt).toLocaleTimeString()}
          </span>
          {data.level > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete();
              }}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Delete branch"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-gray-400 border-2 border-white"
        style={{ bottom: "-6px" }}
      />
    </div>
  );
};

const nodeTypes = {
  chatNode: ChatNode,
};

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

  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [userHasMovedNodes, setUserHasMovedNodes] = useState(false);
  const [nodePositions, setNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const prevSessionIdRef = useRef<string | null>(null);

  const sessionApi = useSessionApi();
  const {
    getSessions,
    getSession,
    createSession: createNewSession,
    createBranch: createNewBranch,
    deleteSession,
    deleteBranch,
  } = sessionApi;

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<{
    sessionId: string;
    branchId: string;
  } | null>(null);

  const { isSignedIn } = useAuth();

  // Helper function to find node by id in tree structure
  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Custom onNodesChange handler to detect user dragging and save positions
  const handleNodesChange = useCallback(
    (changes: any) => {
      // Check if any change is a position change initiated by user
      const positionChanges = changes.filter(
        (change: any) => change.type === "position" && change.dragging
      );

      if (positionChanges.length > 0) {
        setUserHasMovedNodes(true);

        // Save the new positions
        const newPositions = { ...nodePositions };
        positionChanges.forEach((change: any) => {
          if (change.position) {
            newPositions[change.id] = change.position;
          }
        });
        setNodePositions(newPositions);
      }

      onNodesChange(changes);
    },
    [onNodesChange, nodePositions]
  );

  // Convert tree structure to React Flow nodes and edges
  const convertToFlowElements = (
    treeNodes: TreeNode[],
    useSavedPositions: boolean = false
  ) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const nodeWidth = 300;
    const nodeHeight = 180;
    const levelGapY = 250;
    const siblingGapX = 50;

    // Calculate subtree width
    const calculateSubtreeWidth = (node: TreeNode): number => {
      if (!node.children || node.children.length === 0) {
        return nodeWidth;
      }

      const childrenWidth =
        node.children.reduce((sum, child) => {
          return sum + calculateSubtreeWidth(child) + siblingGapX;
        }, 0) - siblingGapX;

      return Math.max(nodeWidth, childrenWidth);
    };

    // Position nodes
    const positionNode = (
      node: TreeNode,
      x: number,
      y: number,
      level: number = 0
    ) => {
      const subtreeWidth = calculateSubtreeWidth(node);

      // Use saved position if available and requested
      const position =
        useSavedPositions && nodePositions[node.id]
          ? nodePositions[node.id]
          : {
              x: x + (subtreeWidth - nodeWidth) / 2,
              y: y,
            };

      // Create flow node
      flowNodes.push({
        id: node.id,
        type: "chatNode",
        position: position,
        data: {
          userMessage: node.user_message,
          llmResponse: node.llm_response,
          createdAt: node.created_at,
          isSelected: selectedNode?.id === node.id,
          isWaiting: waitingForResponse === node.id,
          level: level,
          onClick: () => setSelectedNode(node),
          onDelete: () =>
            setBranchToDelete({
              sessionId: selectedSession!.id,
              branchId: node.id,
            }),
        },
      });

      // Create edge from parent
      if (node.parent_id) {
        flowEdges.push({
          id: `${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          type: "smoothstep",
          animated: waitingForResponse === node.id,
          style: {
            stroke: selectedNode?.id === node.id ? "#3b82f6" : "#cbd5e1",
            strokeWidth: selectedNode?.id === node.id ? 3 : 2,
          },
          markerEnd: {
            type: "arrowclosed",
            color: selectedNode?.id === node.id ? "#3b82f6" : "#cbd5e1",
          },
        });
      }

      // Position children
      if (node.children && node.children.length > 0) {
        let childX = x;
        const childY = y + levelGapY;

        node.children.forEach((child) => {
          const childWidth = calculateSubtreeWidth(child);
          positionNode(child, childX, childY, level + 1);
          childX += childWidth + siblingGapX;
        });
      }
    };

    // Process root nodes
    let rootX = 0;
    treeNodes
      .filter((node) => !node.parent_id)
      .forEach((node) => {
        const treeWidth = calculateSubtreeWidth(node);
        positionNode(node, rootX, 0, 0);
        rootX += treeWidth + siblingGapX * 2;
      });

    return { nodes: flowNodes, edges: flowEdges };
  };

  // Update React Flow when session structure changes
  useEffect(() => {
    if (!selectedSession || selectedSession.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Check if this is a new session
    const isNewSession = prevSessionIdRef.current !== selectedSession.id;
    if (isNewSession) {
      prevSessionIdRef.current = selectedSession.id;
      setNodePositions({});
      setUserHasMovedNodes(false);
    }

    // Always regenerate the tree structure
    const { nodes: flowNodes, edges: flowEdges } = convertToFlowElements(
      selectedSession.nodes,
      !isNewSession && userHasMovedNodes
    );

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [selectedSession]); // Remove other dependencies to avoid circular updates

  // Separate effect for visual updates only (selection, waiting states)
  useEffect(() => {
    if (!selectedSession || nodes.length === 0) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: selectedNode?.id === node.id,
          isWaiting: waitingForResponse === node.id,
        },
      }))
    );

    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        animated: waitingForResponse === edge.target,
        style: {
          stroke: selectedNode?.id === edge.target ? "#3b82f6" : "#cbd5e1",
          strokeWidth: selectedNode?.id === edge.target ? 3 : 2,
        },
        markerEnd: {
          type: "arrowclosed",
          color: selectedNode?.id === edge.target ? "#3b82f6" : "#cbd5e1",
        },
      }))
    );
  }, [selectedNode, waitingForResponse, nodes.length]); // Use nodes.length instead of nodes

  // Load sessions on mount
  useEffect(() => {
    if (!isSignedIn) return;

    let mounted = true;

    const loadSessionSummaries = async () => {
      if (!mounted) return;

      try {
        setLoadingSessions(true);
        const sessions = await getSessions();

        if (!mounted) return;

        const summaries = sessions.map((s) => ({
          id: s.id,
          created_at: s.created_at,
          first_message: s.nodes[0]?.user_message || "Empty session",
        }));
        setSessionSummaries(summaries);
      } catch (err) {
        if (!mounted) return;
        console.error("Error loading sessions:", err);
        setError("Failed to load sessions. Please try again.");
      } finally {
        if (mounted) {
          setLoadingSessions(false);
        }
      }
    };

    loadSessionSummaries();

    return () => {
      mounted = false;
    };
  }, [isSignedIn]); // Remove getSessions from dependencies

  const handleSessionSelect = async (sessionId: string) => {
    if (selectedSession?.id === sessionId) return;

    try {
      setLoadingSession(true);
      setError(null);
      const session = await getSession(sessionId);
      setSelectedSession(session);
      setSelectedNode(null);
      setWaitingForResponse(null);
      setUserHasMovedNodes(false); // Reset when changing sessions
      setNodePositions({}); // Clear saved positions
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

      setSessionSummaries((prev) => [
        {
          id: newSession.id,
          created_at: newSession.created_at,
          first_message: message,
        },
        ...prev,
      ]);

      const optimisticSession: ChatSession = {
        id: newSession.id,
        created_at: newSession.created_at,
        nodes: [
          {
            id: newSession.nodes[0]?.id || "temp-" + Date.now(),
            parent_id: null,
            user_message: message,
            llm_response: "",
            created_at: new Date().toISOString(),
            children: [],
          },
        ],
      };

      setSelectedSession(optimisticSession);
      setSelectedNode(optimisticSession.nodes[0]);
      setShowNewSessionInput(false);
      setWaitingForResponse(newSession.nodes[0]?.id || null);

      // Poll for response
      let attempts = 0;
      const maxAttempts = 20;

      const checkForResponse = async () => {
        attempts++;
        try {
          const session = await getSession(newSession.id);
          const firstNode = session.nodes[0];

          if (firstNode && firstNode.llm_response) {
            setSelectedSession(session);
            setSelectedNode(firstNode);
            setWaitingForResponse(null);
          } else if (attempts < maxAttempts) {
            setTimeout(checkForResponse, 2000);
          } else {
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

      const updatedSession = await getSession(sessionId);
      setSelectedSession(updatedSession);

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

      setWaitingForResponse(newNode.id);

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
                  llm_response: "",
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
      setSelectedNode({
        id: newNode.id,
        parent_id: selectedNode.id,
        user_message: message,
        llm_response: "",
        created_at: new Date().toISOString(),
        children: [],
      });

      // Poll for response
      let attempts = 0;
      const maxAttempts = 20;

      const checkForResponse = async () => {
        attempts++;
        try {
          const updatedSession = await getSession(selectedSession.id);

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
            setSelectedSession(updatedSession);
            setSelectedNode(updatedNode);
            setWaitingForResponse(null);
          } else if (attempts < maxAttempts) {
            setTimeout(checkForResponse, 2000);
          } else {
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

      setTimeout(checkForResponse, 2000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setWaitingForResponse(null);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Please sign in to continue</h1>
        <p className="text-gray-600 mb-6">
          You need to be signed in to access the playground.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Chat Tree Playground</h1>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/sign-out")}
          >
            Sign Out
          </Button>
        </div>

        {error && (
          <div className="mx-4 mt-4">
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

        <div className="flex flex-1 overflow-hidden">
          {/* Sessions Sidebar */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <Button
                size="sm"
                onClick={handleCreateSession}
                disabled={isCreatingSession || showNewSessionInput}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>

            {loadingSessions ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : sessionSummaries.length === 0 ? (
              <div className="text-center text-gray-500">No sessions found</div>
            ) : (
              <div className="space-y-2">
                {sessionSummaries.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? "bg-blue-100 border-blue-500 border"
                        : "bg-white hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="font-medium text-sm truncate">
                      {session.first_message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {showNewSessionInput ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Start a New Session
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your first message to begin
                </p>
                <div className="w-full max-w-2xl">
                  <MessageInput
                    onSubmit={handleNewSessionSubmit}
                    isSubmitting={isCreatingSession}
                    buttonText="Start Session"
                    placeholder="Type your message here..."
                  />
                  <div className="mt-4 text-center">
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
              <div className="flex-1 flex flex-col">
                {/* Tree Visualization */}
                <div className="flex-1 relative">
                  {loadingSession ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-pulse text-gray-500">
                        Loading conversation...
                      </div>
                    </div>
                  ) : (
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={handleNodesChange}
                      onEdgesChange={onEdgesChange}
                      nodeTypes={nodeTypes}
                      connectionMode={ConnectionMode.Loose}
                      fitView
                      fitViewOptions={{ padding: 0.3 }}
                      defaultEdgeOptions={{
                        type: "smoothstep",
                        style: { strokeWidth: 2 },
                      }}
                      proOptions={{ hideAttribution: true }}
                    >
                      <Background variant="dots" />
                      <Controls />
                      <Panel position="top-right" className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => {
                            setUserHasMovedNodes(false);
                            setNodePositions({});
                            if (selectedSession) {
                              const { nodes: flowNodes, edges: flowEdges } =
                                convertToFlowElements(
                                  selectedSession.nodes,
                                  false
                                );
                              setNodes(flowNodes);
                              setEdges(flowEdges);
                            }
                          }}
                        >
                          Reset Layout
                        </Button>
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
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setSessionToDelete(selectedSession.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </Panel>
                    </ReactFlow>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4 bg-white">
                  {selectedNode ? (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h3 className="font-medium text-sm mb-2">
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
                          This will create a new branch from the selected node
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      Select a node to continue the conversation
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No session selected
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select a conversation or create a new one
                  </p>
                  <Button
                    onClick={handleCreateSession}
                    disabled={showNewSessionInput}
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Session
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialogs */}
      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all its
              branches.
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

      <AlertDialog
        open={!!branchToDelete}
        onOpenChange={(open) => !open && setBranchToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this branch and all its replies.
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
