import React, { useState, useEffect, useRef } from 'react';
import { OptimizedRoute, RouteExecution } from '../types/routeOptimization';
import { routeOptimizationService } from '../services/routeOptimizationService';

interface RouteReplayModalProps {
  route: OptimizedRoute;
  onClose: () => void;
}

const RouteReplayModal: React.FC<RouteReplayModalProps> = ({ route, onClose }) => {
  const [executionData, setExecutionData] = useState<RouteExecution[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadExecutionData();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [route.id]);

  const loadExecutionData = async () => {
    try {
      setLoading(true);
      const data = await routeOptimizationService.getRouteExecution(route.id);
      setExecutionData(data);
    } catch (error) {
      console.error('Error loading execution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      handlePause();
      return;
    }

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= executionData.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    handlePause();
    setCurrentIndex(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      handlePause();
      setPlaybackSpeed(speed);
      handlePlay();
    }
  };

  const currentExecution = executionData[currentIndex];
  const routeCoordinates = routeOptimizationService.parseRouteCoordinates(route.routeCoordinates);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal route-replay-modal">
        <div className="modal-header">
          <h2>Route Replay - {route.name}</h2>
          <button onClick={onClose} className="btn btn-secondary">×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <p>Loading route execution data...</p>
            </div>
          ) : executionData.length === 0 ? (
            <div className="empty-state">
              <h3>No Execution Data</h3>
              <p>This route has no execution data available for replay.</p>
            </div>
          ) : (
            <>
              {/* Map Container */}
              <div className="map-container">
                <div className="map-placeholder">
                  <h4>Route Visualization</h4>
                  <div className="route-info">
                    <p><strong>Vehicle:</strong> {route.vehicleLicensePlate}</p>
                    <p><strong>Driver:</strong> {route.driverName || 'Unassigned'}</p>
                    <p><strong>Total Distance:</strong> {route.actualDistanceKm ? routeOptimizationService.formatDistance(route.actualDistanceKm) : 'N/A'}</p>
                    <p><strong>Duration:</strong> {route.actualDurationHours ? routeOptimizationService.formatDuration(route.actualDurationHours) : 'N/A'}</p>
                  </div>
                  
                  {currentExecution && (
                    <div className="current-position">
                      <h5>Current Position</h5>
                      <p><strong>Time:</strong> {formatTime(currentExecution.timestamp)}</p>
                      <p><strong>Location:</strong> {currentExecution.latitude.toFixed(6)}, {currentExecution.longitude.toFixed(6)}</p>
                      <p><strong>Speed:</strong> {currentExecution.speed ? `${currentExecution.speed.toFixed(1)} km/h` : 'N/A'}</p>
                      <p><strong>Direction:</strong> {currentExecution.direction ? `${currentExecution.direction.toFixed(0)}°` : 'N/A'}</p>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`deviation-type ${currentExecution.deviationType.toLowerCase()}`}>
                          {routeOptimizationService.getDeviationTypeIcon(currentExecution.deviationType)} {currentExecution.deviationType.replace(/_/g, ' ')}
                        </span>
                      </p>
                      {currentExecution.distanceFromPlannedKm && (
                        <p><strong>Deviation:</strong> {routeOptimizationService.formatDistance(currentExecution.distanceFromPlannedKm)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="playback-controls">
                <div className="control-buttons">
                  <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                    disabled={currentIndex === 0}
                  >
                    ⏮️ Reset
                  </button>
                  <button
                    onClick={handlePlay}
                    className="btn btn-primary"
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <button
                    onClick={() => setCurrentIndex(Math.min(currentIndex + 1, executionData.length - 1))}
                    className="btn btn-secondary"
                    disabled={currentIndex >= executionData.length - 1}
                  >
                    ⏭️ Next
                  </button>
                </div>

                <div className="speed-controls">
                  <label>Speed:</label>
                  <button
                    onClick={() => handleSpeedChange(0.5)}
                    className={`btn btn-sm ${playbackSpeed === 0.5 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    0.5x
                  </button>
                  <button
                    onClick={() => handleSpeedChange(1)}
                    className={`btn btn-sm ${playbackSpeed === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    1x
                  </button>
                  <button
                    onClick={() => handleSpeedChange(2)}
                    className={`btn btn-sm ${playbackSpeed === 2 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    2x
                  </button>
                  <button
                    onClick={() => handleSpeedChange(4)}
                    className={`btn btn-sm ${playbackSpeed === 4 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    4x
                  </button>
                </div>

                <div className="progress-bar">
                  <input
                    type="range"
                    min="0"
                    max={executionData.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="progress-slider"
                  />
                  <div className="progress-info">
                    <span>{currentIndex + 1} / {executionData.length}</span>
                    <span>{Math.round((currentIndex / (executionData.length - 1)) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Route Stops Progress */}
              <div className="stops-progress">
                <h4>Route Stops</h4>
                <div className="stops-list">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className={`stop-item ${stop.isCompleted ? 'completed' : 'pending'}`}>
                      <div className="stop-number">{index + 1}</div>
                      <div className="stop-info">
                        <strong>{stop.name}</strong>
                        <span className="stop-type">{routeOptimizationService.getStopTypeDisplayName(stop.stopType)}</span>
                        {stop.actualArrivalTime && (
                          <span className="arrival-time">Arrived: {formatTime(stop.actualArrivalTime)}</span>
                        )}
                      </div>
                      <div className="stop-status">
                        {stop.isCompleted ? '✅' : '⏳'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Statistics */}
              <div className="execution-stats">
                <h4>Execution Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <label>Total Points:</label>
                    <span>{executionData.length}</span>
                  </div>
                  <div className="stat-item">
                    <label>On Route:</label>
                    <span>{executionData.filter(e => e.deviationType === 'ON_ROUTE').length}</span>
                  </div>
                  <div className="stat-item">
                    <label>Minor Deviations:</label>
                    <span>{executionData.filter(e => e.deviationType === 'MINOR_DEVIATION').length}</span>
                  </div>
                  <div className="stat-item">
                    <label>Major Deviations:</label>
                    <span>{executionData.filter(e => e.deviationType === 'MAJOR_DEVIATION').length}</span>
                  </div>
                  <div className="stat-item">
                    <label>Average Speed:</label>
                    <span>
                      {executionData.filter(e => e.speed).length > 0 ? 
                        `${(executionData.filter(e => e.speed).reduce((sum, e) => sum + (e.speed || 0), 0) / 
                          executionData.filter(e => e.speed).length).toFixed(1)} km/h` : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Max Speed:</label>
                    <span>
                      {Math.max(...executionData.map(e => e.speed || 0)).toFixed(1)} km/h
                    </span>
                  </div>
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

export default RouteReplayModal;