"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  THead,
  TBody,
  TRow,
  TCell,
  THeaderCell,
} from "@/components/ui/table";
import { useClerkApiFetch } from "@/utils/clerkApiFetch";
import { useAuth } from "@clerk/nextjs";

interface ApiKey {
  id: string;
  created_at: string;
  last_used_at?: string | null;
  is_active: boolean;
}

export default function Dashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const clerkApiFetch = useClerkApiFetch();
  const { isSignedIn } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);
    clerkApiFetch(`${API_BASE}/api/v1/keys/`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch API keys");
        return res.json();
      })
      .then(setKeys)
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  const handleGenerate = async () => {
    const res = await clerkApiFetch(`${API_BASE}/api/v1/keys/generate`, {
      method: "POST",
    });
    if (!res.ok) {
      alert("Failed to generate API key");
      return;
    }
    const data = await res.json();
    setNewKey(data.api_key);
    setShowDialog(true);
    // Refresh keys
    clerkApiFetch(`${API_BASE}/api/v1/keys/`).then(async (res) => {
      if (res.ok) setKeys(await res.json());
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div />
            <Button onClick={handleGenerate}>Generate API Key</Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <THead>
                <TRow>
                  <THeaderCell>Key ID</THeaderCell>
                  <THeaderCell>Created</THeaderCell>
                  <THeaderCell>Last Used</THeaderCell>
                  <THeaderCell>Status</THeaderCell>
                </TRow>
              </THead>
              <TBody>
                {keys.map((key) => (
                  <TRow key={key.id}>
                    <TCell>{key.id}</TCell>
                    <TCell>{new Date(key.created_at).toLocaleString()}</TCell>
                    <TCell>
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleString()
                        : "Never"}
                    </TCell>
                    <TCell>
                      {key.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </TCell>
                    <TCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!key.is_active}
                        onClick={async () => {
                          await clerkApiFetch(
                            `${API_BASE}/api/v1/keys/${key.id}`,
                            { method: "DELETE" }
                          );
                          // Refresh keys after deactivation
                          clerkApiFetch(`${API_BASE}/api/v1/keys/`).then(
                            async (res) => {
                              if (res.ok) setKeys(await res.json());
                            }
                          );
                        }}
                      >
                        Deactivate
                      </Button>
                    </TCell>
                  </TRow>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold">Your new API key</h2>
          <div className="bg-muted px-4 py-2 rounded font-mono text-sm break-all border">
            {newKey}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Please copy and store this API key securely. You will not be able to
            see it again.
          </div>
          <Button onClick={() => setShowDialog(false)}>Close</Button>
        </div>
      </Dialog>
    </main>
  );
}
