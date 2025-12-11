import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TrackingPage from './pages/TrackingPage';
import ReportsPage from './pages/ReportsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import FuelPage from './pages/FuelPage';
import GeofencingPage from './pages/GeofencingPage';
import RouteOptimizationPage from './pages/RouteOptimizationPage';
import SpeedMonitoringPage from './pages/SpeedMonitoringPage';
import ErrorBoundary from './components/ErrorBoundary';

function Navigation() {
  const location = useLocation();

  return (
    <div className="header">
      <h1>GPS Vehicle Tracking System</h1>
      <nav className="nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/vehicles" className={location.pathname === '/vehicles' ? 'active' : ''}>
          Vehicles
        </Link>
        <Link to="/drivers" className={location.pathname === '/drivers' ? 'active' : ''}>
          Drivers
        </Link>
        <Link to="/tracking" className={location.pathname === '/tracking' ? 'active' : ''}>
          Tracking
        </Link>
        <Link to="/assignments" className={location.pathname === '/assignments' ? 'active' : ''}>
          Assignments
        </Link>
        <Link to="/fuel" className={location.pathname === '/fuel' ? 'active' : ''}>
          Fuel Management
        </Link>
        <Link to="/geofencing" className={location.pathname === '/geofencing' ? 'active' : ''}>
          Geofencing & Alerts
        </Link>
        <Link to="/route-optimization" className={location.pathname === '/route-optimization' ? 'active' : ''}>
          Route Optimization
        </Link>
        <Link to="/speed-monitoring" className={location.pathname === '/speed-monitoring' ? 'active' : ''}>
          Speed Monitoring
        </Link>
        <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
          Reports
        </Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/fuel" element={<ErrorBoundary><FuelPage /></ErrorBoundary>} />
          <Route path="/geofencing" element={<ErrorBoundary><GeofencingPage /></ErrorBoundary>} />
          <Route path="/route-optimization" element={<ErrorBoundary><RouteOptimizationPage /></ErrorBoundary>} />
          <Route path="/speed-monitoring" element={<ErrorBoundary><SpeedMonitoringPage /></ErrorBoundary>} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

