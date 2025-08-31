import React, { useState, useEffect, useCallback } from 'react';
import { DeliveryGrid } from './DeliveryGrid';
import { SimulationControls } from './SimulationControls';
import { EventPanel } from './EventPanel';
import { RouteCalculator } from './RouteCalculator';
import { 
  DeliveryPoint, 
  Vehicle, 
  GridCell, 
  Route, 
  SimulationEvent, 
  SimulationState 
} from './types';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZE = 10;

export const DeliverySimulation: React.FC = () => {
  const { toast } = useToast();
  
  // Initialize grid
  const initializeGrid = (): GridCell[][] => {
    const grid: GridCell[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({ x, y, blocked: false, trafficLevel: 0 });
      }
      grid.push(row);
    }
    return grid;
  };

  // State
  const [grid] = useState<GridCell[][]>(initializeGrid());
  const [depot] = useState({ x: 0, y: 0 });
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>(
    () => RouteCalculator.generateRandomDeliveryPoints(7, GRID_SIZE, { x: 0, y: 0 })
  );
  const [vehicle, setVehicle] = useState<Vehicle>({
    id: 'truck-1',
    x: 0,
    y: 0,
    status: 'idle',
    capacity: 10,
    currentLoad: 7
  });
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [trafficJams, setTrafficJams] = useState<{ x: number; y: number }[]>([]);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 0,
    currentTime: new Date().toLocaleTimeString()
  });

  // Generate initial route
  useEffect(() => {
    const initialRoute = RouteCalculator.nearestNeighborRoute(depot, deliveryPoints, trafficJams);
    setCurrentRoute(initialRoute);
    setSimulationState(prev => ({ ...prev, totalSteps: initialRoute.path.length }));
  }, [depot, deliveryPoints, trafficJams]);

  // Simulation loop
  useEffect(() => {
    if (!simulationState.isRunning || simulationState.isPaused || !currentRoute) return;

    const interval = setInterval(() => {
      setSimulationState(prev => {
        const nextStep = prev.currentStep + 1;
        
        if (nextStep >= currentRoute.path.length) {
          // Simulation completed
          toast({
            title: "Delivery Complete! 🎉",
            description: `All deliveries completed in ${currentRoute.estimatedTime} minutes`
          });
          
          return {
            ...prev,
            isRunning: false,
            currentStep: 0
          };
        }

        // Move vehicle to next position
        const nextPosition = currentRoute.path[nextStep];
        setVehicle(prev => ({
          ...prev,
          x: nextPosition.x,
          y: nextPosition.y,
          status: 'moving'
        }));

        // Check if we reached a delivery point
        const deliveredPoint = deliveryPoints.find(dp => 
          dp.x === nextPosition.x && dp.y === nextPosition.y && !dp.delivered
        );
        
        if (deliveredPoint) {
          setDeliveryPoints(prev => 
            prev.map(dp => 
              dp.id === deliveredPoint.id ? { ...dp, delivered: true } : dp
            )
          );
          
          toast({
            title: "Package Delivered! 📦",
            description: `Delivered to ${deliveredPoint.address}`
          });
        }

        return {
          ...prev,
          currentStep: nextStep,
          currentTime: new Date().toLocaleTimeString()
        };
      });
    }, 1500); // Move every 1.5 seconds

    return () => clearInterval(interval);
  }, [simulationState.isRunning, simulationState.isPaused, currentRoute, deliveryPoints, toast]);

  // Event handlers
  const handleStart = useCallback(() => {
    setSimulationState(prev => ({ 
      ...prev, 
      isRunning: true, 
      isPaused: false 
    }));
  }, []);

  const handlePause = useCallback(() => {
    setSimulationState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const handleStop = useCallback(() => {
    setSimulationState(prev => ({ 
      ...prev, 
      isRunning: false, 
      isPaused: false,
      currentStep: 0
    }));
    setVehicle(prev => ({ ...prev, x: depot.x, y: depot.y, status: 'idle' }));
  }, [depot]);

  const handleReset = useCallback(() => {
    setSimulationState({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: 0,
      currentTime: new Date().toLocaleTimeString()
    });
    
    const newDeliveryPoints = RouteCalculator.generateRandomDeliveryPoints(7, GRID_SIZE, depot);
    setDeliveryPoints(newDeliveryPoints);
    setVehicle(prev => ({ ...prev, x: depot.x, y: depot.y, status: 'idle' }));
    setTrafficJams([]);
    setEvents([]);
    setCurrentRoute(null);
    
    toast({
      title: "Simulation Reset",
      description: "New delivery scenario generated"
    });
  }, [depot, toast]);

  const handleGenerateRoute = useCallback(() => {
    const newRoute = RouteCalculator.nearestNeighborRoute(depot, deliveryPoints, trafficJams);
    setCurrentRoute(newRoute);
    setSimulationState(prev => ({ ...prev, totalSteps: newRoute.path.length, currentStep: 0 }));
    setVehicle(prev => ({ ...prev, x: depot.x, y: depot.y }));
    
    toast({
      title: "Route Generated",
      description: `New route with ${newRoute.totalDistance} units distance`
    });
  }, [depot, deliveryPoints, trafficJams, toast]);

  const handleOptimizeWithAI = useCallback(() => {
    const activeEvent = events.find(e => e.active);
    const optimizedRoute = RouteCalculator.simulateAIOptimization(
      depot, 
      deliveryPoints, 
      trafficJams,
      activeEvent?.description
    );
    
    setCurrentRoute(optimizedRoute);
    setSimulationState(prev => ({ ...prev, totalSteps: optimizedRoute.path.length, currentStep: 0 }));
    setVehicle(prev => ({ ...prev, x: depot.x, y: depot.y }));
    
    toast({
      title: "AI Optimization Complete! 🤖",
      description: `Route optimized: ${optimizedRoute.totalDistance} units (-${Math.floor(Math.random() * 20 + 10)}%)`
    });
  }, [depot, deliveryPoints, trafficJams, events, toast]);

  const handleTriggerEvent = useCallback(() => {
    const eventTypes: SimulationEvent['type'][] = ['traffic_jam', 'road_closure', 'new_order'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (x === depot.x && y === depot.y);

    const newEvent: SimulationEvent = {
      id: `event-${Date.now()}`,
      type: eventType,
      location: { x, y },
      description: getEventDescription(eventType, x, y),
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      timestamp: new Date(),
      active: true
    };

    setEvents(prev => [...prev, newEvent]);

    if (eventType === 'traffic_jam' || eventType === 'road_closure') {
      setTrafficJams(prev => [...prev, { x, y }]);
    }

    toast({
      title: `${eventType.replace('_', ' ').toUpperCase()} Detected! ⚠️`,
      description: newEvent.description,
      variant: "destructive"
    });
  }, [depot, toast]);

  const handleResolveEvent = useCallback((eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, active: false } : event
      )
    );

    const event = events.find(e => e.id === eventId);
    if (event && (event.type === 'traffic_jam' || event.type === 'road_closure')) {
      setTrafficJams(prev => 
        prev.filter(tj => !(tj.x === event.location.x && tj.y === event.location.y))
      );
    }

    toast({
      title: "Event Resolved ✅",
      description: "Traffic cleared, routes updated"
    });
  }, [events, toast]);

  const handleOptimizeForEvent = useCallback((eventId: string) => {
    handleOptimizeWithAI();
  }, [handleOptimizeWithAI]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Smart Delivery Route Simulation</h1>
          <p className="text-muted-foreground">
            AI-powered logistics optimization with real-time event handling
          </p>
        </div>

        {/* Main Simulation Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Grid Visualization */}
          <div className="lg:col-span-2 space-y-4">
            <DeliveryGrid
              grid={grid}
              depot={depot}
              deliveryPoints={deliveryPoints}
              vehicle={vehicle}
              currentRoute={currentRoute}
              trafficJams={trafficJams}
            />
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-depot rounded"></div>
                <span>Depot (🏢)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-delivery-point rounded"></div>
                <span>Delivery Point (📦)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-vehicle rounded"></div>
                <span>Vehicle (🚛)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-traffic-jam rounded"></div>
                <span>Traffic Jam (🚧)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-route-planned rounded"></div>
                <span>Planned Route</span>
              </div>
            </div>
          </div>

          {/* Controls and Events */}
          <div className="space-y-6">
            <SimulationControls
              simulationState={simulationState}
              currentRoute={currentRoute}
              onStart={handleStart}
              onPause={handlePause}
              onStop={handleStop}
              onReset={handleReset}
              onGenerateRoute={handleGenerateRoute}
              onOptimizeWithAI={handleOptimizeWithAI}
              onTriggerEvent={handleTriggerEvent}
            />
            
            <EventPanel
              events={events}
              onResolveEvent={handleResolveEvent}
              onOptimizeForEvent={handleOptimizeForEvent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
function getEventDescription(type: SimulationEvent['type'], x: number, y: number): string {
  switch (type) {
    case 'traffic_jam':
      return `Heavy traffic reported at intersection (${x}, ${y}). Consider alternate route.`;
    case 'road_closure':
      return `Road closure at (${x}, ${y}) due to construction. Route recalculation needed.`;
    case 'new_order':
      return `Urgent delivery request received near (${x}, ${y}). Update route priorities.`;
    case 'vehicle_breakdown':
      return `Vehicle maintenance required at (${x}, ${y}). Backup vehicle dispatched.`;
    default:
      return `Event detected at (${x}, ${y}). Route optimization recommended.`;
  }
}