import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimulationEvent } from './types';
import { AlertTriangle, Clock, MapPin, X } from 'lucide-react';

interface EventPanelProps {
  events: SimulationEvent[];
  onResolveEvent: (eventId: string) => void;
  onOptimizeForEvent: (eventId: string) => void;
}

export const EventPanel: React.FC<EventPanelProps> = ({
  events,
  onResolveEvent,
  onOptimizeForEvent
}) => {
  const activeEvents = events.filter(event => event.active);
  const recentEvents = events.filter(event => !event.active).slice(0, 3);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'traffic_jam':
        return '🚧';
      case 'road_closure':
        return '🚫';
      case 'new_order':
        return '📦';
      case 'vehicle_breakdown':
        return '🔧';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Events & Disruptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-destructive">Active Events</h4>
            {activeEvents.map((event) => (
              <div key={event.id} className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{event.type.replace('_', ' ').toUpperCase()}</span>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location: ({event.location.x}, {event.location.y})
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-foreground">{event.description}</p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => onOptimizeForEvent(event.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Optimize Route
                  </Button>
                  <Button
                    onClick={() => onResolveEvent(event.id)}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Resolved Events */}
        {recentEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Events</h4>
            {recentEvents.map((event) => (
              <div key={event.id} className="p-2 border border-muted bg-muted/30 rounded space-y-1">
                <div className="flex items-center gap-2">
                  <span>{getEventIcon(event.type)}</span>
                  <span className="text-xs font-medium">{event.type.replace('_', ' ').toUpperCase()}</span>
                  <Badge variant="outline">Resolved</Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Events */}
        {events.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events detected</p>
            <p className="text-xs">Trigger events to test route optimization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};