'use client';

import { useState, useEffect } from 'react';
import { EventCard, Event } from '@/components/event-card';
import { Loader2, AlertCircle, Zap } from 'lucide-react';

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceOptions, setDeviceOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'confidence'>('latest');

  // Fetch events from API
  const fetchEvents = async (deviceFilter?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/events', window.location.origin);
      if (deviceFilter) {
        url.searchParams.set('device_id', deviceFilter);
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      const events = data.events || [];
      
      if (!Array.isArray(events)) {
        throw new Error('Invalid response format: events must be an array');
      }
      
      setAllEvents(events);

      // Extract unique device IDs for filter dropdown
      const devices = Array.from(new Set(events.map((e: Event) => e.device_id)));
      setDeviceOptions(devices as string[]);

      // Apply filter
      let filtered = deviceFilter
        ? events.filter((e: Event) => e.device_id === deviceFilter)
        : events;

      // Apply sorting
      if (sortBy === 'confidence') {
        filtered.sort((a, b) => b.confidence - a.confidence);
      } else {
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setEvents(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents(selectedDevice || undefined);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDevice, sortBy]);

  // Handle device filter change
  const handleDeviceFilter = (deviceId: string | null) => {
    setSelectedDevice(deviceId);
    fetchEvents(deviceId || undefined);
  };

  // Count stats
  const ratDetections = events.filter((e) => e.label === 'rat').length;
  const emptyTraps = events.filter((e) => e.label === 'empty').length;
  const highConfidenceRats = events.filter(
    (e) => e.label === 'rat' && e.confidence >= 0.9
  ).length;
  const avgConfidence =
    events.length > 0
      ? Math.round(
          (events.reduce((sum, e) => sum + e.confidence, 0) / events.length) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Smart Farm Monitoring
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Real-time AI-powered pest detection dashboard
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-3">
                <div className="text-red-300 font-semibold">{ratDetections}</div>
                <div className="text-muted-foreground text-xs">Rats Detected</div>
              </div>
              <div className="bg-red-600/15 border border-red-500/40 rounded-lg px-3 py-3">
                <div className="text-red-200 font-semibold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {highConfidenceRats}
                </div>
                <div className="text-muted-foreground text-xs">High Confidence</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-3">
                <div className="text-green-300 font-semibold">{emptyTraps}</div>
                <div className="text-muted-foreground text-xs">Empty Traps</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-3">
                <div className="text-blue-300 font-semibold">{avgConfidence}%</div>
                <div className="text-muted-foreground text-xs">Avg Confidence</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Filter by Trap ID
              </label>
              <select
                value={selectedDevice || ''}
                onChange={(e) =>
                  handleDeviceFilter(e.target.value || null)
                }
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="">All Traps</option>
                {deviceOptions.map((device) => (
                  <option key={device} value={device}>
                    {device}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'confidence')}
                className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="latest">Latest Events</option>
                <option value="confidence">Highest Confidence</option>
              </select>
            </div>

            {/* Refresh Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Auto-refresh: 5s
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-destructive/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg bg-secondary/20">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="text-lg font-semibold mb-1">No events found</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              {selectedDevice
                ? `No detections from trap ${selectedDevice} yet. Check back soon!`
                : 'No trap events to display. Monitoring traps are ready for deployment.'}
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Detection Events ({events.length})
              </h2>
              <button
                onClick={() => fetchEvents(selectedDevice || undefined)}
                className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Refresh Now
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, idx) => (
                <EventCard key={`${event.device_id}-${idx}`} event={event} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>
            IoT Smart Farming System • Real-time Monitoring • Connected to localhost:5000
          </p>
        </div>
      </footer>
    </div>
  );
}
