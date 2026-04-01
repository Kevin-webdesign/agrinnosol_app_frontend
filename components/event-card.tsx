'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export interface Event {
  device_id: string;
  image_url: string;
  label: 'rat' | 'empty';
  confidence: number;
  created_at: string;
}

export function EventCard({ event }: { event: Event }) {
  const isRat = event.label === 'rat';
  const confidencePercent = Math.round(event.confidence * 100);
  const isHighConfidenceRat = isRat && event.confidence >= 0.9;

  return (
    <div
      className={`rounded-lg overflow-hidden border-2 transition-all relative ${
        isHighConfidenceRat
          ? 'border-red-600/80 shadow-2xl shadow-red-500/40 ring-1 ring-red-500/50'
          : isRat
            ? 'border-red-500/60 shadow-lg shadow-red-500/20'
            : 'border-green-500/40 shadow-md'
      } bg-card hover:shadow-lg hover:shadow-accent/20 duration-300`}
    >
      {/* High Confidence Alert Badge */}
      {isHighConfidenceRat && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          ALERT
        </div>
      )}
      {/* Image Container */}
      <div className="relative h-48 w-full bg-secondary overflow-hidden">
        <Image
          src={event.image_url}
          alt={`Trap ${event.device_id} - ${event.label}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Device ID */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Trap ID
          </span>
          <span className="text-sm font-medium text-foreground">{event.device_id}</span>
        </div>

        {/* Label Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Detection
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isRat
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-green-500/20 text-green-300 border border-green-500/40'
            }`}
          >
            {event.label}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Confidence
          </span>
          <div className="flex items-center gap-2 w-24">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  isRat ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-accent">
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {format(new Date(event.created_at), 'MMM dd, yyyy HH:mm:ss')}
          </span>
        </div>
      </div>
    </div>
  );
}
