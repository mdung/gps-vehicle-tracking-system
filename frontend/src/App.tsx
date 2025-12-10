import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import TrackingPage from './pages/TrackingPage';
import ReportsPage from './pages/ReportsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import FuelPage from './pages/FuelPage';
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
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

