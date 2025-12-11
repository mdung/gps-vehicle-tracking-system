import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../services/maintenanceService';
import {
  MaintenanceReminder,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority
} from '../types/maintenance';
import CreateScheduleModal from '../components/maintenance/CreateScheduleModal';
import CreateRecordModal from '../components/maintenance/CreateRecordModal';
import CreateTypeModal from '../components/maintenance/CreateTypeModal';
import './MaintenancePage.css';

interface MaintenancePageProps {}

const MaintenancePage: React.FC<MaintenancePageProps> = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedules' | 'records' | 'reminders' | 'types'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<MaintenanceReminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<MaintenanceReminder[]>([]);
  const [recentRecords, setRecentRecords] = useState<MaintenanceRecord[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Data states
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);

  // Modal states
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const [showCreateType, setShowCreateType] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        unacknowledgedReminders,
        overdueData,
        upcomingData,
        recordsData,
        analyticsData
      ] = await Promise.all([
        maintenanceService.getUnacknowledgedReminders(),
        maintenanceService.getOverdueReminders(),
        maintenanceService.getUpcomingReminders(30),
        maintenanceService.getMaintenanceRecords(0, 5),
        maintenanceService.getMaintenanceAnalytics()
      ]);

      setReminders(unacknowledgedReminders);
      setOverdueReminders(overdueData);
      setUpcomingReminders(upcomingData);
      setRecentRecords(recordsData.content);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await maintenanceService.getMaintenanceSchedules(0, 50);
      setSchedules(data.content);
    } catch (err) {
      setError('Failed to load schedules');
    }
  };

  const loadRecords = async () => {
    try {
      const data = await maintenanceService.getMaintenanceRecords(0, 50);
      setRecords(data.content);
    } catch (err) {
      setError('Failed to load records');
    }
  };

  const loadMaintenanceTypes = async () => {
    try {
      const data = await maintenanceService.getAllActiveMaintenanceTypes();
      setMaintenanceTypes(data);
    } catch (err) {
      setError('Failed to load maintenance types');
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'schedules':
        loadSchedules();
        break;
      case 'records':
        loadRecords();
        break;
      case 'types':
        loadMaintenanceTypes();
        break;
    }
  };

  const acknowledgeReminder = async (reminderId: string) => {
    try {
      await maintenanceService.acknowledgeReminder(reminderId, 'Current User');
      loadDashboardData();
    } catch (err) {
      setError('Failed to acknowledge reminder');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority: MaintenancePriority) => {
    switch (priority) {
      case MaintenancePriority.CRITICAL:
      case MaintenancePriority.EMERGENCY:
        return 'text-red-600 bg-red-100';
      case MaintenancePriority.HIGH:
        return 'text-orange-600 bg-orange-100';
      case MaintenancePriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case MaintenanceStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case MaintenanceStatus.SCHEDULED:
        return 'text-purple-600 bg-purple-100';
      case MaintenanceStatus.CANCELLED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="maintenance-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      <div className="maintenance-header">
        <h1>Maintenance Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateRecord(true)}
          >
            Add Maintenance Record
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCreateSchedule(true)}
          >
            Create Schedule
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="maintenance-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => handleTabChange('schedules')}
        >
          Schedules
        </button>
        <button 
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => handleTabChange('records')}
        >
          Records
        </button>
        <button 
          className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => handleTabChange('reminders')}
        >
          Reminders
        </button>
        <button 
          className={`tab ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => handleTabChange('types')}
        >
          Types
        </button>
      </div>

      <div className="maintenance-content">
        {activeTab === 'dashboard' && (
          <DashboardTab
            analytics={analytics}
            overdueReminders={overdueReminders}
            upcomingReminders={upcomingReminders}
            recentRecords={recentRecords}
            onAcknowledgeReminder={acknowledgeReminder}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesTab
            schedules={schedules}
            onCreateSchedule={() => setShowCreateSchedule(true)}
            onEditSchedule={(schedule) => {
              setSelectedItem(schedule);
              setShowCreateSchedule(true);
            }}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'records' && (
          <RecordsTab
            records={records}
            onCreateRecord={() => setShowCreateRecord(true)}
            onEditRecord={(record) => {
              setSelectedItem(record);
              setShowCreateRecord(true);
            }}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            onAcknowledgeReminder={acknowledgeReminder}
            formatDate={formatDate}
            getPriorityColor={getPriorityColor}
          />
        )}

        {activeTab === 'types' && (
          <TypesTab
            maintenanceTypes={maintenanceTypes}
            onCreateType={() => setShowCreateType(true)}
            onEditType={(type) => {
              setSelectedItem(type);
              setShowCreateType(true);
            }}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Modals */}
      <CreateScheduleModal
        isOpen={showCreateSchedule}
        onClose={() => {
          setShowCreateSchedule(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          if (activeTab === 'schedules') loadSchedules();
          loadDashboardData();
        }}
        editSchedule={selectedItem && showCreateSchedule ? selectedItem : undefined}
      />

      <CreateRecordModal
        isOpen={showCreateRecord}
        onClose={() => {
          setShowCreateRecord(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          if (activeTab === 'records') loadRecords();
          loadDashboardData();
        }}
        editRecord={selectedItem && showCreateRecord ? selectedItem : undefined}
      />

      <CreateTypeModal
        isOpen={showCreateType}
        onClose={() => {
          setShowCreateType(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          if (activeTab === 'types') loadMaintenanceTypes();
        }}
        editType={selectedItem && showCreateType ? selectedItem : undefined}
      />
    </div>
  );
};

// Dashboard Tab Component
interface DashboardTabProps {
  analytics: any;
  overdueReminders: MaintenanceReminder[];
  upcomingReminders: MaintenanceReminder[];
  recentRecords: MaintenanceRecord[];
  onAcknowledgeReminder: (id: string) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getPriorityColor: (priority: MaintenancePriority) => string;
  getStatusColor: (status: MaintenanceStatus) => string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  analytics,
  overdueReminders,
  upcomingReminders,
  recentRecords,
  onAcknowledgeReminder,
  formatDate,
  formatCurrency,
  getPriorityColor,
  getStatusColor
}) => (
  <div className="dashboard-tab">
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Total Cost (This Month)</h3>
        <p className="stat-value">{analytics ? formatCurrency(analytics.totalCost) : '$0'}</p>
      </div>
      <div className="stat-card">
        <h3>Maintenance Count</h3>
        <p className="stat-value">{analytics ? analytics.maintenanceCount : 0}</p>
      </div>
      <div className="stat-card">
        <h3>Overdue Items</h3>
        <p className="stat-value critical">{overdueReminders.length}</p>
      </div>
      <div className="stat-card">
        <h3>Upcoming (30 days)</h3>
        <p className="stat-value">{upcomingReminders.length}</p>
      </div>
    </div>

    <div className="dashboard-sections">
      <div className="dashboard-section">
        <h3>Overdue Maintenance</h3>
        <div className="reminder-list">
          {overdueReminders.length === 0 ? (
            <p className="no-data">No overdue maintenance items</p>
          ) : (
            overdueReminders.map(reminder => (
              <div key={reminder.id} className="reminder-item overdue">
                <div className="reminder-info">
                  <h4>{reminder.maintenanceSchedule.maintenanceType.name}</h4>
                  <p>Vehicle: {reminder.vehicle.licensePlate}</p>
                  <p>Due: {formatDate(reminder.dueDate)} ({reminder.daysOverdue} days overdue)</p>
                </div>
                <div className="reminder-actions">
                  <span className={`priority-badge ${getPriorityColor(reminder.priority)}`}>
                    {reminder.priority}
                  </span>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => onAcknowledgeReminder(reminder.id)}
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Upcoming Maintenance</h3>
        <div className="reminder-list">
          {upcomingReminders.slice(0, 5).map(reminder => (
            <div key={reminder.id} className="reminder-item">
              <div className="reminder-info">
                <h4>{reminder.maintenanceSchedule.maintenanceType.name}</h4>
                <p>Vehicle: {reminder.vehicle.licensePlate}</p>
                <p>Due: {formatDate(reminder.dueDate)}</p>
              </div>
              <span className={`priority-badge ${getPriorityColor(reminder.priority)}`}>
                {reminder.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Recent Maintenance</h3>
        <div className="record-list">
          {recentRecords.map(record => (
            <div key={record.id} className="record-item">
              <div className="record-info">
                <h4>{record.maintenanceType.name}</h4>
                <p>Vehicle: {record.vehicle.licensePlate}</p>
                <p>Date: {formatDate(record.serviceDate)}</p>
                <p>Cost: {formatCurrency(record.totalCost || 0)}</p>
              </div>
              <span className={`status-badge ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Schedules Tab Component
interface SchedulesTabProps {
  schedules: MaintenanceSchedule[];
  onCreateSchedule: () => void;
  onEditSchedule: (schedule: MaintenanceSchedule) => void;
  formatDate: (date: string) => string;
}

const SchedulesTab: React.FC<SchedulesTabProps> = ({
  schedules,
  onCreateSchedule,
  onEditSchedule,
  formatDate
}) => (
  <div className="schedules-tab">
    <div className="tab-header">
      <h2>Maintenance Schedules</h2>
      <button className="btn btn-primary" onClick={onCreateSchedule}>
        Create Schedule
      </button>
    </div>
    
    <div className="schedules-table">
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Maintenance Type</th>
            <th>Schedule Type</th>
            <th>Interval</th>
            <th>Last Service</th>
            <th>Next Due</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id}>
              <td>{schedule.vehicle.licensePlate}</td>
              <td>{schedule.maintenanceType.name}</td>
              <td>{schedule.scheduleType}</td>
              <td>
                {schedule.mileageInterval && `${schedule.mileageInterval} miles`}
                {schedule.timeIntervalDays && `${schedule.timeIntervalDays} days`}
              </td>
              <td>
                {schedule.lastServiceDate ? formatDate(schedule.lastServiceDate) : 'Never'}
              </td>
              <td>
                {schedule.nextDueDate ? formatDate(schedule.nextDueDate) : 'Not scheduled'}
              </td>
              <td>
                <span className={`status-badge ${schedule.isOverdue ? 'overdue' : 'active'}`}>
                  {schedule.isOverdue ? 'Overdue' : 'Active'}
                </span>
              </td>
              <td>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEditSchedule(schedule)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Records Tab Component
interface RecordsTabProps {
  records: MaintenanceRecord[];
  onCreateRecord: () => void;
  onEditRecord: (record: MaintenanceRecord) => void;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: MaintenanceStatus) => string;
  getPriorityColor: (priority: MaintenancePriority) => string;
}

const RecordsTab: React.FC<RecordsTabProps> = ({
  records,
  onCreateRecord,
  onEditRecord,
  formatDate,
  formatCurrency,
  getStatusColor,
  getPriorityColor
}) => (
  <div className="records-tab">
    <div className="tab-header">
      <h2>Maintenance Records</h2>
      <button className="btn btn-primary" onClick={onCreateRecord}>
        Add Record
      </button>
    </div>
    
    <div className="records-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Provider</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td>{formatDate(record.serviceDate)}</td>
              <td>{record.vehicle.licensePlate}</td>
              <td>{record.maintenanceType.name}</td>
              <td>{record.serviceProvider || 'N/A'}</td>
              <td>{formatCurrency(record.totalCost || 0)}</td>
              <td>
                <span className={`status-badge ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </td>
              <td>
                <span className={`priority-badge ${getPriorityColor(record.priority)}`}>
                  {record.priority}
                </span>
              </td>
              <td>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => onEditRecord(record)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Reminders Tab Component
interface RemindersTabProps {
  reminders: MaintenanceReminder[];
  onAcknowledgeReminder: (id: string) => void;
  formatDate: (date: string) => string;
  getPriorityColor: (priority: MaintenancePriority) => string;
}

const RemindersTab: React.FC<RemindersTabProps> = ({
  reminders,
  onAcknowledgeReminder,
  formatDate,
  getPriorityColor
}) => (
  <div className="reminders-tab">
    <div className="tab-header">
      <h2>Maintenance Reminders</h2>
    </div>
    
    <div className="reminders-list">
      {reminders.map(reminder => (
        <div key={reminder.id} className="reminder-card">
          <div className="reminder-header">
            <h3>{reminder.maintenanceSchedule.maintenanceType.name}</h3>
            <span className={`priority-badge ${getPriorityColor(reminder.priority)}`}>
              {reminder.priority}
            </span>
          </div>
          <div className="reminder-details">
            <p><strong>Vehicle:</strong> {reminder.vehicle.licensePlate}</p>
            <p><strong>Due Date:</strong> {formatDate(reminder.dueDate)}</p>
            {reminder.daysOverdue > 0 && (
              <p className="overdue-text">
                <strong>Overdue by:</strong> {reminder.daysOverdue} days
              </p>
            )}
            <p><strong>Message:</strong> {reminder.message}</p>
          </div>
          {!reminder.isAcknowledged && (
            <div className="reminder-actions">
              <button 
                className="btn btn-primary"
                onClick={() => onAcknowledgeReminder(reminder.id)}
              >
                Acknowledge
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Types Tab Component
interface TypesTabProps {
  maintenanceTypes: MaintenanceType[];
  onCreateType: () => void;
  onEditType: (type: MaintenanceType) => void;
  formatCurrency: (amount: number) => string;
}

const TypesTab: React.FC<TypesTabProps> = ({
  maintenanceTypes,
  onCreateType,
  onEditType,
  formatCurrency
}) => (
  <div className="types-tab">
    <div className="tab-header">
      <h2>Maintenance Types</h2>
      <button className="btn btn-primary" onClick={onCreateType}>
        Create Type
      </button>
    </div>
    
    <div className="types-grid">
      {maintenanceTypes.map(type => (
        <div key={type.id} className="type-card">
          <div className="type-header">
            <h3>{type.name}</h3>
            <span className="category-badge">{type.category}</span>
          </div>
          <div className="type-details">
            <p>{type.description}</p>
            <div className="type-stats">
              <span>Duration: {type.estimatedDurationHours || 0}h</span>
              <span>Cost: {formatCurrency(type.estimatedCost || 0)}</span>
            </div>
          </div>
          <div className="type-actions">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => onEditType(type)}
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MaintenancePage;