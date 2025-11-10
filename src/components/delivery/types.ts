export interface DeliveryPoint {
  id: string;
  x: number;
  y: number;
  address: string;
  delivered: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'moving' | 'delivering';
  capacity: number;
  currentLoad: number;
}

export interface GridCell {
  x: number;
  y: number;
  blocked: boolean;
  trafficLevel: number;
}

export interface Route {
  id: string;
  path: { x: number; y: number }[];
  totalDistance: number;
  estimatedTime: number;
  optimizedBy: 'manual' | 'nearest_neighbor' | 'ai_agent';
}

export interface SimulationEvent {
  id: string;
  type: 'traffic_jam' | 'road_closure' | 'new_order' | 'vehicle_breakdown';
  location: { x: number; y: number };
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  active: boolean;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentTime: string;
  speed: number;
}