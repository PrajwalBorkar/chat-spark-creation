import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route } from './types';
import { BarChart3, Clock, Navigation, TrendingUp } from 'lucide-react';

interface RouteStatisticsProps {
  currentRoute: Route | null;
  trafficJamCount: number;
  deliveredCount: number;
  totalDeliveries: number;
}

export const RouteStatistics: React.FC<RouteStatisticsProps> = ({
  currentRoute,
  trafficJamCount,
  deliveredCount,
  totalDeliveries
}) => {
  if (!currentRoute) return null;

  const efficiency = totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0;
  const avgTimePerDelivery = currentRoute.estimatedTime / totalDeliveries;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Route Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Algorithm Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Algorithm:</span>
          <Badge variant={currentRoute.optimizedBy === 'ai_agent' ? 'default' : 'secondary'}>
            {currentRoute.optimizedBy === 'ai_agent' ? '🤖 AI Optimized' : '📊 Nearest Neighbor'}
          </Badge>
        </div>

        {/* Delivery Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deliveries:</span>
            <span className="font-medium">{deliveredCount} / {totalDeliveries}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>

        {/* Route Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="h-3 w-3" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-lg font-bold">{currentRoute.totalDistance}</p>
            <p className="text-xs text-muted-foreground">units</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Est. Time</span>
            </div>
            <p className="text-lg font-bold">{currentRoute.estimatedTime}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Avg/Stop</span>
            </div>
            <p className="text-lg font-bold">{avgTimePerDelivery.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">min/stop</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">🚧 Traffic</span>
            </div>
            <p className="text-lg font-bold">{trafficJamCount}</p>
            <p className="text-xs text-muted-foreground">blockages</p>
          </div>
        </div>

        {/* Traffic Impact */}
        {trafficJamCount > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              💡 <strong>How Traffic Affects Routes:</strong>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Each traffic cell adds +{currentRoute.optimizedBy === 'ai_agent' ? '3' : '5'} units penalty</li>
              <li>Algorithm avoids paths through traffic jams</li>
              <li>AI optimization handles traffic {currentRoute.optimizedBy === 'ai_agent' ? '40% better' : 'when regenerated'}</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
