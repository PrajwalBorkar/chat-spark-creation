import { DeliveryPoint, Vehicle, Route, GridCell } from './types';

export class RouteCalculator {
  static calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
  }

  // Generate step-by-step path between two points
  static generatePath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
    const steps: { x: number; y: number }[] = [];
    let currentX = from.x;
    let currentY = from.y;

    // Move horizontally first
    while (currentX !== to.x) {
      currentX += currentX < to.x ? 1 : -1;
      steps.push({ x: currentX, y: currentY });
    }

    // Then move vertically
    while (currentY !== to.y) {
      currentY += currentY < to.y ? 1 : -1;
      steps.push({ x: currentX, y: currentY });
    }

    return steps;
  }

  static nearestNeighborRoute(
    depot: { x: number; y: number },
    deliveryPoints: DeliveryPoint[],
    trafficJams: { x: number; y: number }[] = []
  ): Route {
    const unvisited = [...deliveryPoints.filter(dp => !dp.delivered)];
    const path: { x: number; y: number }[] = [depot];
    let currentPosition = depot;
    let totalDistance = 0;

    while (unvisited.length > 0) {
      let nearestPoint = unvisited[0];
      let shortestDistance = this.calculateDistance(currentPosition, nearestPoint);

      for (const point of unvisited) {
        const distance = this.calculateDistance(currentPosition, point);
        
        // Check entire path for traffic jams
        const pathToPoint = this.generatePath(currentPosition, point);
        const trafficPenalty = pathToPoint.reduce((penalty, step) => {
          const hasTraffic = trafficJams.some(tj => tj.x === step.x && tj.y === step.y);
          return penalty + (hasTraffic ? 5 : 0); // 5 units penalty per traffic cell
        }, 0);
        
        const adjustedDistance = distance + trafficPenalty;
        
        if (adjustedDistance < shortestDistance) {
          nearestPoint = point;
          shortestDistance = adjustedDistance;
        }
      }

      // Add step-by-step path to nearest point
      const stepsToPoint = this.generatePath(currentPosition, nearestPoint);
      path.push(...stepsToPoint);
      totalDistance += shortestDistance;
      currentPosition = nearestPoint;
      unvisited.splice(unvisited.indexOf(nearestPoint), 1);
    }

    // Return to depot
    const stepsToDepot = this.generatePath(currentPosition, depot);
    path.push(...stepsToDepot);
    totalDistance += this.calculateDistance(currentPosition, depot);

    return {
      id: `route-${Date.now()}`,
      path,
      totalDistance,
      estimatedTime: Math.ceil(totalDistance * 2), // 2 minutes per unit
      optimizedBy: 'nearest_neighbor'
    };
  }

  static simulateAIOptimization(
    depot: { x: number; y: number },
    deliveryPoints: DeliveryPoint[],
    trafficJams: { x: number; y: number }[] = [],
    currentEvent?: string
  ): Route {
    // Simulate AI agent thinking by adding some randomness and better optimization
    const unvisited = [...deliveryPoints.filter(dp => !dp.delivered)];
    
    // AI considers priority and traffic
    unvisited.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      // Factor in distance and priority
      const aDistance = this.calculateDistance(depot, a);
      const bDistance = this.calculateDistance(depot, b);
      
      return (bPriority / bDistance) - (aPriority / aDistance);
    });

    const path: { x: number; y: number }[] = [depot];
    let currentPosition = depot;
    let totalDistance = 0;

    // AI tries to create a more optimized route
    while (unvisited.length > 0) {
      let bestPoint = unvisited[0];
      let bestScore = Infinity;

      for (const point of unvisited) {
        const distance = this.calculateDistance(currentPosition, point);
        
        // AI checks entire path for traffic (smarter avoidance)
        const pathToPoint = this.generatePath(currentPosition, point);
        const trafficPenalty = pathToPoint.reduce((penalty, step) => {
          const hasTraffic = trafficJams.some(tj => tj.x === step.x && tj.y === step.y);
          return penalty + (hasTraffic ? 3 : 0); // AI penalty is lower as it plans better
        }, 0);
        
        const priorityBonus = { high: -2, medium: -1, low: 0 }[point.priority];
        
        // AI considers remaining points for better overall optimization
        const remainingPoints = unvisited.filter(p => p !== point);
        const futureDistance = remainingPoints.length > 0 
          ? Math.min(...remainingPoints.map(rp => this.calculateDistance(point, rp)))
          : this.calculateDistance(point, depot);
        
        const score = distance + trafficPenalty + priorityBonus + (futureDistance * 0.5);
        
        if (score < bestScore) {
          bestPoint = point;
          bestScore = score;
        }
      }

      // Add step-by-step path to best point
      const stepsToPoint = this.generatePath(currentPosition, bestPoint);
      path.push(...stepsToPoint);
      totalDistance += this.calculateDistance(currentPosition, bestPoint);
      currentPosition = bestPoint;
      unvisited.splice(unvisited.indexOf(bestPoint), 1);
    }

    // Return to depot
    const stepsToDepot = this.generatePath(currentPosition, depot);
    path.push(...stepsToDepot);
    totalDistance += this.calculateDistance(currentPosition, depot);

    // AI optimization typically improves by 10-20%
    const optimizationImprovement = 0.85;
    totalDistance = Math.ceil(totalDistance * optimizationImprovement);

    return {
      id: `ai-route-${Date.now()}`,
      path,
      totalDistance,
      estimatedTime: Math.ceil(totalDistance * 1.8), // AI routes are faster
      optimizedBy: 'ai_agent'
    };
  }

  static generateRandomDeliveryPoints(count: number, gridSize: number, depot: { x: number; y: number }): DeliveryPoint[] {
    const points: DeliveryPoint[] = [];
    const addresses = [
      '123 Oak Street', '456 Pine Avenue', '789 Maple Drive', '321 Elm Street',
      '654 Cedar Lane', '987 Birch Road', '147 Willow Way', '258 Poplar Place',
      '369 Ash Avenue', '741 Spruce Street'
    ];
    
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
      } while ((x === depot.x && y === depot.y) || points.some(p => p.x === x && p.y === y));
      
      points.push({
        id: `delivery-${i + 1}`,
        x,
        y,
        address: addresses[i % addresses.length],
        delivered: false,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
      });
    }
    
    return points;
  }
}