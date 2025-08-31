import React from 'react';
import { DeliveryPoint, Vehicle, GridCell, Route } from './types';

interface DeliveryGridProps {
  grid: GridCell[][];
  depot: { x: number; y: number };
  deliveryPoints: DeliveryPoint[];
  vehicle: Vehicle;
  currentRoute: Route | null;
  trafficJams: { x: number; y: number }[];
  onCellClick?: (x: number, y: number) => void;
}

export const DeliveryGrid: React.FC<DeliveryGridProps> = ({
  grid,
  depot,
  deliveryPoints,
  vehicle,
  currentRoute,
  trafficJams,
  onCellClick
}) => {
  const getCellContent = (x: number, y: number) => {
    // Check if this is the depot
    if (depot.x === x && depot.y === y) {
      return (
        <div className="w-full h-full bg-depot rounded-sm flex items-center justify-center">
          <span className="text-depot-foreground font-bold text-xs">🏢</span>
        </div>
      );
    }

    // Check if this is a delivery point
    const deliveryPoint = deliveryPoints.find(dp => dp.x === x && dp.y === y);
    if (deliveryPoint) {
      return (
        <div className={`w-full h-full rounded-sm flex items-center justify-center ${
          deliveryPoint.delivered ? 'bg-muted' : 'bg-delivery-point'
        }`}>
          <span className={`font-bold text-xs ${
            deliveryPoint.delivered ? 'text-muted-foreground' : 'text-delivery-point-foreground'
          }`}>
            {deliveryPoint.delivered ? '✓' : '📦'}
          </span>
        </div>
      );
    }

    // Check if this is the vehicle position
    if (vehicle.x === x && vehicle.y === y) {
      return (
        <div className="w-full h-full bg-vehicle rounded-sm flex items-center justify-center">
          <span className="text-vehicle-foreground font-bold text-xs">🚛</span>
        </div>
      );
    }

    // Check if this is a traffic jam
    if (trafficJams.some(tj => tj.x === x && tj.y === y)) {
      return (
        <div className="w-full h-full bg-traffic-jam rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-xs">🚧</span>
        </div>
      );
    }

    // Check if this cell is part of the route
    const isOnRoute = currentRoute?.path.some(point => point.x === x && point.y === y);
    if (isOnRoute) {
      return (
        <div className="w-full h-full bg-route-planned rounded-sm flex items-center justify-center">
          <span className="text-route-active font-bold text-xs">•</span>
        </div>
      );
    }

    // Empty cell
    return <div className="w-full h-full bg-grid-cell rounded-sm" />;
  };

  return (
    <div className="grid grid-cols-10 gap-1 p-4 bg-background border border-grid-border rounded-lg">
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="w-8 h-8 border border-grid-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onCellClick?.(x, y)}
            title={`Cell (${x}, ${y})`}
          >
            {getCellContent(x, y)}
          </div>
        ))
      )}
    </div>
  );
};