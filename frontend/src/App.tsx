import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Pencari/Home';
import LostReport from './pages/Pencari/LostReport';
import LostItems from './pages/Pencari/LostItems';
import MyReports from './pages/Pencari/MyReports';

import PetugasDashboard from './pages/Petugas/Dashboard';
import InputFoundItem from './pages/Petugas/InputFoundItem';
import ReportList from './pages/Petugas/ReportList';
import ReportDetail from './pages/Petugas/ReportDetail';
import HandoverHistory from './pages/Petugas/HandoverHistory';

import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import CreateUser from './pages/Admin/CreateUser';
import ActivityLog from './pages/Admin/ActivityLog';
import UserDetail from './pages/Admin/UserDetail';
import Profile from './pages/Profile';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {/* Pencari Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/report-lost" element={<LostReport />} />
          <Route path="/lost-items" element={<LostItems />} />
          <Route path="/my-reports" element={<MyReports />} />
          
          {/* Petugas Routes */}
          <Route path="/petugas/dashboard" element={<PetugasDashboard />} />
          <Route path="/petugas/input" element={<InputFoundItem />} />
          <Route path="/petugas/reports" element={<ReportList />} />
          <Route path="/petugas/reports/:id" element={<ReportDetail />} />
          <Route path="/petugas/history" element={<HandoverHistory />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/create" element={<CreateUser />} />
          <Route path="/admin/users/:id" element={<UserDetail />} />
          <Route path="/admin/logs" element={<ActivityLog />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Shared Routes */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
