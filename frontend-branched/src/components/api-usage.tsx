'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClerkApiFetch } from "@/utils/clerkApiFetch";
import { useAuth } from "@clerk/nextjs";
import { Table, THead, TBody, TRow, TCell, THeaderCell } from "@/components/ui/table";

interface EndpointStats {
  endpoint: string;
  methods: Record<string, number>;
}

interface ApiUsageData {
  user_id: string;
  start_date: string;
  end_date: string;
  total_requests: number;
  by_endpoint: EndpointStats[];
}

export function ApiUsage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiUsageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clerkApiFetch = useClerkApiFetch();
  const { isSignedIn } = useAuth();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Set default date range (last 7 days)
  useEffect(() => {
    if (!isSignedIn) return;
    
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [isSignedIn]);

  const fetchUsageData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      
      const res = await clerkApiFetch(`${API_BASE}/api/v1/usage?${params}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch usage data');
      }
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <Card className="w-full max-w-4xl mt-8">
      <CardHeader>
        <CardTitle>API Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="end-date" className="block text-sm font-medium mb-1">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchUsageData}
                disabled={loading || !startDate || !endDate}
                className="w-full sm:w-auto"
              >
                {loading ? 'Loading...' : 'Get Usage'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {data && (
            <div className="mt-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing usage from {new Date(data.start_date).toLocaleDateString()} to {new Date(data.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium">
                  Total Requests: {data.total_requests.toLocaleString()}
                </p>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <THead>
                    <TRow>
                      <THeaderCell>Endpoint</THeaderCell>
                      <THeaderCell>Methods</THeaderCell>
                      <THeaderCell className="text-right">Total Calls</THeaderCell>
                    </TRow>
                  </THead>
                  <TBody>
                    {data.by_endpoint.length > 0 ? (
                      data.by_endpoint.map((item, index) => (
                        <TRow key={index}>
                          <TCell className="font-mono text-sm">{item.endpoint}</TCell>
                          <TCell>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(item.methods).map(([method, count]) => (
                                <span 
                                  key={method}
                                  className="px-2 py-1 text-xs rounded bg-muted"
                                >
                                  {method}: {count.toLocaleString()}
                                </span>
                              ))}
                            </div>
                          </TCell>
                          <TCell className="text-right">
                            {Object.values(item.methods).reduce((a, b) => a + b, 0).toLocaleString()}
                          </TCell>
                        </TRow>
                      ))
                    ) : (
                      <TRow>
                        <TCell className="text-center py-4 text-muted-foreground">
                          No API usage data found for the selected period.
                        </TCell>
                        <TCell className="hidden sm:table-cell" />
                        <TCell className="hidden sm:table-cell" />
                      </TRow>
                    )}
                  </TBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
