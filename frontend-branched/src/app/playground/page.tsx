"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionApi } from "@/utils/sessionApi";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Send, Plus, GitBranch, RefreshCw } from "lucide-react";

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
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    getSessions, 
    getSession, 
    createSession: createNewSession, 
    sendMessage: sendNewMessage, 
    createBranch: createNewBranch, 
    refreshSessions 
  } = useSessionApi();
  
  const { isSignedIn, signOut } = useAuth();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.nodes]);

  useEffect(() => {
    if (!isSignedIn) return;
    
    const loadSessions = async () => {
      try {
        setLoading(true);
        const data = await getSessions();
        setSessions(data);
      } catch (err) {
        console.error("Error loading sessions:", err);
        setError("Failed to load sessions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadSessions();
  }, [isSignedIn, getSessions]);

  const handleSessionSelect = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const session = await getSession(sessionId);
      setSelectedSession(session);
      setSelectedNode(null);
    } catch (err) {
      console.error("Error fetching session:", err);
      setError("Failed to load session. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);
      setError(null);
      const newSession = await createNewSession();
      await refreshSessions();
      await handleSessionSelect(newSession.id);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!selectedSession) return;
    
    try {
      setIsSendingMessage(true);
      setError(null);
      
      const parentId = selectedNode?.id || null;
      await sendNewMessage(selectedSession.id, parentId || selectedSession.id, message);
      
      // Refresh the session to get the updated tree
      const updatedSession = await getSession(selectedSession.id);
      setSelectedSession(updatedSession);
      
      // Select the new message node
      const newNode = findNodeById(updatedSession.nodes, updatedSession.nodes[0]?.id);
      if (newNode) {
        setSelectedNode(newNode);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  const handleCreateBranch = async (message: string) => {
    if (!selectedSession || !selectedNode) return;
    
    try {
      setIsCreatingBranch(true);
      setError(null);
      
      await createNewBranch(selectedSession.id, selectedNode.id, message);
      
      // Refresh the session to get the updated tree
      const updatedSession = await getSession(selectedSession.id);
      setSelectedSession(updatedSession);
      
      // Select the new branch node
      const newNode = findNodeById(updatedSession.nodes, updatedSession.nodes[0]?.id);
      if (newNode) {
        setSelectedNode(newNode);
      }
    } catch (err) {
      console.error("Error creating branch:", err);
      setError("Failed to create branch. Please try again.");
    } finally {
      setIsCreatingBranch(false);
    }
  };
  
  const findNodeById = (nodes: TreeNode[], nodeId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === nodeId) return node;
      if (node.children.length > 0) {
        const found = findNodeById(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  };
  
  const renderNode = (node: TreeNode, level = 0) => {
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const marginLeft = level * 16; // Convert level to pixels for consistent spacing

    return (
      <div key={node.id} className="mb-2" style={{ marginLeft: `${marginLeft}px` }}>
        <div 
          className={`p-3 rounded-md cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => setSelectedNode(node)}
        >
          <div className="font-medium text-gray-900">
            {node.user_message || "(No message)"}
          </div>
          <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
            {node.llm_response}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(node.created_at), { addSuffix: true })}
          </div>
        </div>
        
        {hasChildren && (
          <div className="mt-2">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Please sign in to continue</h1>
        <p className="text-gray-600 mb-6">You need to be signed in to access the playground.</p>
        <Button onClick={() => signOut()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Chat Sessions Playground</h1>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <Button 
              size="sm" 
              onClick={handleCreateSession}
              disabled={isCreatingSession}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
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
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSessionSelect(session.id)}
                    >
                      <div className="font-medium text-sm truncate">
                        {session.nodes[0]?.user_message?.substring(0, 40) || 'New Session'}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
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
          {selectedSession ? (
            <>
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {selectedSession.nodes[0]?.user_message?.substring(0, 40) || 'New Session'}...
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSessionSelect(selectedSession.id)}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-pulse text-gray-500">Loading conversation...</div>
                    </div>
                  ) : selectedSession.nodes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedSession.nodes
                        .filter(node => !node.parent_id) // Only render root nodes
                        .map(node => renderNode(node, 0))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <p>No messages in this session yet. Send a message to get started.</p>
                    </div>
                  )}
                </CardContent>
                
                <div className="p-4 border-t">
                  <div className="space-y-3">
                    {selectedNode && (
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md mb-2">
                        <div className="text-sm text-blue-700 truncate">
                          Replying to: {selectedNode.user_message?.substring(0, 60)}...
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedNode(null)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    <MessageInput
                      onSubmit={handleSendMessage}
                      isSubmitting={isSendingMessage}
                      placeholder={selectedNode ? "Reply to this message..." : "Type your message..."}
                    />
                    
                    {selectedNode && (
                      <MessageInput
                        onSubmit={handleCreateBranch}
                        isSubmitting={isCreatingBranch}
                        buttonText={
                          <span className="flex items-center">
                            <GitBranch className="h-4 w-4 mr-1" />
                            Create Branch
                          </span>
                        }
                        placeholder="Enter a message to start a new branch..."
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">No session selected</h3>
                <p className="text-gray-500 mb-4">
                  Select an existing session or create a new one to get started
                </p>
                <Button onClick={handleCreateSession} disabled={isCreatingSession}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreatingSession ? 'Creating...' : 'New Session'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
