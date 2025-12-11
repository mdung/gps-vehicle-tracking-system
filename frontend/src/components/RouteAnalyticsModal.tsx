import React, { useState, useEffect } from 'react';
import { OptimizedRoute, RouteAnalytics } from '../types/routeOptimization';
import { routeOptimizationService } from '../services/routeOptimizationService';

interface RouteAnalyticsModalProps {
  route: OptimizedRoute;
  onClose: () => void;
}

const RouteAnalyticsModal: React.FC<RouteAnalyticsModalProps> = ({ route, onClose }) => {
  const [analytics, setAnalytics] = useState<RouteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [route.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await routeOptimizationService.getRouteAnalytics(route.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateVariancePercentage = (planned?: number, actual?: number): string => {
    if (!planned || !actual) return 'N/A';
    const variance = ((actual - planned) / planned) * 100;
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getVarianceColor = (planned?: number, actual?: number): string => {
    if (!planned || !actual) return '#6c757d';
    const variance = ((actual - planned) / planned) * 100;
    if (Math.abs(variance) <= 5) return '#28a745'; // Green for good
    if (Math.abs(variance) <= 15) return '#ffc107'; // Yellow for moderate
    return '#dc3545'; // Red for poor
  };

  return (
    <div className="modal-overlay">
      <div className="modal route-analytics-modal">
        <div className="modal-header">
          <h2>Route Analytics - {route.name}</h2>
          <button onClick={onClose} className="btn btn-secondary">×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <p>Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Route Overview */}
              <div className="analytics-section">
                <h3>Route Overview</h3>
                <div className="overview-grid">
                  <div className="overview-item">
                    <label>Vehicle:</label>
                    <span>{route.vehicleLicensePlate}</span>
                  </div>
                  <div className="overview-item">
                    <label>Driver:</label>
                    <span>{route.driverName || 'Unassigned'}</span>
                  </div>
                  <div className="overview-item">
                    <label>Optimization Type:</label>
                    <span>{routeOptimizationService.getOptimizationTypeDisplayName(route.optimizationType)}</span>
                  </div>
                  <div className="overview-item">
                    <label>Status:</label>
                    <span 
                      style={{ color: routeOptimizationService.getRouteStatusColor(route.status) }}
                    >
                      {routeOptimizationService.getRouteStatusDisplayName(route.status)}
                    </span>
                  </div>
                  <div className="overview-item">
                    <label>Planned Start:</label>
                    <span>{formatTime(route.plannedStartTime)}</span>
                  </div>
                  <div className="overview-item">
                    <label>Actual Start:</label>
                    <span>{formatTime(route.actualStartTime)}</span>
                  </div>
                  <div className="overview-item">
                    <label>Planned End:</label>
                    <span>{formatTime(route.plannedEndTime)}</span>
                  </div>
                  <div className="overview-item">
                    <label>Actual End:</label>
                    <span>{formatTime(route.actualEndTime)}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="analytics-section">
                <h3>Performance Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Distance</h4>
                    <div className="metric-comparison">
                      <div className="metric-item">
                        <label>Planned:</label>
                        <span>{route.totalDistanceKm ? routeOptimizationService.formatDistance(route.totalDistanceKm) : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Actual:</label>
                        <span>{route.actualDistanceKm ? routeOptimizationService.formatDistance(route.actualDistanceKm) : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Variance:</label>
                        <span style={{ color: getVarianceColor(route.totalDistanceKm, route.actualDistanceKm) }}>
                          {calculateVariancePercentage(route.totalDistanceKm, route.actualDistanceKm)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Duration</h4>
                    <div className="metric-comparison">
                      <div className="metric-item">
                        <label>Planned:</label>
                        <span>{route.estimatedDurationHours ? routeOptimizationService.formatDuration(route.estimatedDurationHours) : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Actual:</label>
                        <span>{route.actualDurationHours ? routeOptimizationService.formatDuration(route.actualDurationHours) : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Variance:</label>
                        <span style={{ color: getVarianceColor(route.estimatedDurationHours, route.actualDurationHours) }}>
                          {calculateVariancePercentage(route.estimatedDurationHours, route.actualDurationHours)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Fuel Cost</h4>
                    <div className="metric-comparison">
                      <div className="metric-item">
                        <label>Estimated:</label>
                        <span>{route.estimatedFuelCost ? `$${route.estimatedFuelCost.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Actual:</label>
                        <span>{route.actualFuelCost ? `$${route.actualFuelCost.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <label>Variance:</label>
                        <span style={{ color: getVarianceColor(route.estimatedFuelCost, route.actualFuelCost) }}>
                          {calculateVariancePercentage(route.estimatedFuelCost, route.actualFuelCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Efficiency Score</h4>
                    <div className="efficiency-display">
                      <div className="score-circle">
                        <span 
                          className="score-value"
                          style={{ 
                            color: route.efficiencyScore ? 
                              routeOptimizationService.getPerformanceRatingColor(analytics?.performanceRating || 'N/A') : 
                              '#6c757d'
                          }}
                        >
                          {routeOptimizationService.formatEfficiencyScore(route.efficiencyScore)}
                        </span>
                      </div>
                      <div className="performance-rating">
                        <span 
                          style={{ 
                            color: route.efficiencyScore ? 
                              routeOptimizationService.getPerformanceRatingColor(analytics?.performanceRating || 'N/A') : 
                              '#6c757d'
                          }}
                        >
                          {analytics?.performanceRating || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stop Analysis */}
              {analytics && (
                <div className="analytics-section">
                  <h3>Stop Analysis</h3>
                  <div className="stops-analytics">
                    <div className="stops-summary">
                      <div className="summary-item">
                        <label>Total Stops:</label>
                        <span>{analytics.totalStops}</span>
                      </div>
                      <div className="summary-item">
                        <label>Completed:</label>
                        <span>{analytics.completedStops}</span>
                      </div>
                      <div className="summary-item">
                        <label>Completion Rate:</label>
                        <span>{analytics.completionPercentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="stops-progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${analytics.completionPercentage}%`,
                          backgroundColor: analytics.completionPercentage >= 100 ? '#28a745' : 
                                         analytics.completionPercentage >= 80 ? '#ffc107' : '#dc3545'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Route Deviations */}
              {analytics && (
                <div className="analytics-section">
                  <h3>Route Deviations</h3>
                  <div className="deviations-grid">
                    <div className="deviation-item">
                      <label>Average Deviation:</label>
                      <span>{routeOptimizationService.formatDistance(analytics.averageDeviationKm)}</span>
                    </div>
                    <div className="deviation-item">
                      <label>Total Deviations:</label>
                      <span>{analytics.totalDeviations}</span>
                    </div>
                    <div className="deviation-item">
                      <label>Time Variance:</label>
                      <span 
                        style={{ 
                          color: Math.abs(analytics.timeVarianceHours) <= 0.25 ? '#28a745' : 
                                Math.abs(analytics.timeVarianceHours) <= 0.5 ? '#ffc107' : '#dc3545'
                        }}
                      >
                        {analytics.timeVarianceHours > 0 ? '+' : ''}{routeOptimizationService.formatDuration(Math.abs(analytics.timeVarianceHours))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Stop Information */}
              <div className="analytics-section">
                <h3>Stop Details</h3>
                <div className="stops-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Planned Arrival</th>
                        <th>Actual Arrival</th>
                        <th>Service Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {route.stops.map((stop, index) => (
                        <tr key={stop.id}>
                          <td>{index + 1}</td>
                          <td>{stop.name}</td>
                          <td>{routeOptimizationService.getStopTypeDisplayName(stop.stopType)}</td>
                          <td>{stop.plannedArrivalTime ? formatTime(stop.plannedArrivalTime) : 'N/A'}</td>
                          <td>{stop.actualArrivalTime ? formatTime(stop.actualArrivalTime) : 'N/A'}</td>
                          <td>
                            {stop.actualServiceTimeMinutes ? 
                              `${stop.actualServiceTimeMinutes.toFixed(0)}min` : 
                              stop.estimatedServiceTimeMinutes ? 
                                `${stop.estimatedServiceTimeMinutes.toFixed(0)}min (est)` : 'N/A'
                            }
                          </td>
                          <td>
                            <span className={`status ${stop.isCompleted ? 'completed' : 'pending'}`}>
                              {stop.isCompleted ? '✅ Completed' : '⏳ Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="analytics-section">
                <h3>Recommendations</h3>
                <div className="recommendations">
                  {route.efficiencyScore && route.efficiencyScore < 70 && (
                    <div className="recommendation warning">
                      <strong>⚠️ Low Efficiency Score:</strong> Consider reviewing route optimization settings or driver training.
                    </div>
                  )}
                  {analytics && analytics.totalDeviations > 5 && (
                    <div className="recommendation warning">
                      <strong>🚨 High Deviation Count:</strong> Route may need adjustment or better traffic data integration.
                    </div>
                  )}
                  {analytics && Math.abs(analytics.timeVarianceHours) > 0.5 && (
                    <div className="recommendation warning">
                      <strong>⏰ Significant Time Variance:</strong> Review time estimates and consider buffer time adjustments.
                    </div>
                  )}
                  {route.efficiencyScore && route.efficiencyScore >= 90 && (
                    <div className="recommendation success">
                      <strong>🎉 Excellent Performance:</strong> This route execution was highly efficient!
                    </div>
                  )}
                  {analytics && analytics.completionPercentage >= 100 && (
                    <div className="recommendation success">
                      <strong>✅ All Stops Completed:</strong> Perfect route execution with all stops completed.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteAnalyticsModal;