"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionApi } from "@/utils/sessionApi";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

interface TreeNode {
  id: string;
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
  const [loading, setLoading] = useState(true);
  const { getSessions, getSession } = useSessionApi();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;
    
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isSignedIn, getSessions]);

  const handleSessionSelect = async (sessionId: string) => {
    try {
      const session = await getSession(sessionId);
      setSelectedSession(session);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => (
      <div key={node.id} className="ml-4 pl-4 border-l-2 border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="font-medium text-sm text-gray-700">User:</p>
          <p className="mb-2">{node.user_message}</p>
          <p className="font-medium text-sm text-gray-700">Assistant:</p>
          <p className="whitespace-pre-wrap">{node.llm_response}</p>
        </div>
        {node.children.length > 0 && (
          <div className="mt-2">
            {renderTree(node.children)}
          </div>
        )}
      </div>
    ));
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to view your chat sessions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat Sessions Playground</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Sessions</CardTitle>
              <CardDescription>
                {sessions.length === 0 
                  ? "No sessions found" 
                  : `Showing ${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={selectedSession?.id === session.id ? "default" : "outline"}
                    className={`w-full justify-start text-left h-auto py-2 mb-2 ${selectedSession?.id === session.id ? 'bg-gray-900 text-white' : ''}`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="text-left">
                      <div className="font-medium truncate">
                        Session {session.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedSession 
                  ? `Session ${selectedSession.id.substring(0, 8)}...` 
                  : 'Select a session'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSession ? (
                <div className="space-y-6">
                  {selectedSession.nodes.length > 0 ? (
                    renderTree(selectedSession.nodes)
                  ) : (
                    <p className="text-gray-500">No messages in this session yet.</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Select a session to view its contents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
