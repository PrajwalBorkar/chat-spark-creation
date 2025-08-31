import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimulationState, Route } from './types';
import { Play, Pause, Square, RotateCcw, Zap, MapPin } from 'lucide-react';

interface SimulationControlsProps {
  simulationState: SimulationState;
  currentRoute: Route | null;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onGenerateRoute: () => void;
  onOptimizeWithAI: () => void;
  onTriggerEvent: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulationState,
  currentRoute,
  onStart,
  onPause,
  onStop,
  onReset,
  onGenerateRoute,
  onOptimizeWithAI,
  onTriggerEvent
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulation Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={simulationState.isRunning ? "default" : "secondary"}>
            {simulationState.isRunning ? (simulationState.isPaused ? "Paused" : "Running") : "Stopped"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Step {simulationState.currentStep} / {simulationState.totalSteps}
          </span>
        </div>

        {/* Current Route Info */}
        {currentRoute && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Route:</span>
              <Badge variant="outline">{currentRoute.optimizedBy.replace('_', ' ').toUpperCase()}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Distance: {currentRoute.totalDistance} units • 
              Est. Time: {currentRoute.estimatedTime} min • 
              Stops: {currentRoute.path.length - 1}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          {!simulationState.isRunning ? (
            <Button onClick={onStart} size="sm" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <>
              {simulationState.isPaused ? (
                <Button onClick={onStart} size="sm" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={onPause} variant="secondary" size="sm" className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={onStop} variant="destructive" size="sm" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          
          <Button onClick={onReset} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Route Generation */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Route Planning</h4>
          <div className="flex gap-2">
            <Button onClick={onGenerateRoute} variant="outline" size="sm">
              Generate Route
            </Button>
            <Button onClick={onOptimizeWithAI} size="sm" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Optimize
            </Button>
          </div>
        </div>

        {/* Event Triggers */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Simulation Events</h4>
          <Button onClick={onTriggerEvent} variant="outline" size="sm" className="w-full">
            Trigger Random Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};