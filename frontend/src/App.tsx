import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Pencari/Home';
import LostReport from './pages/Pencari/LostReport';
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

import { Toaster } from 'react-hot-toast';

// Komponen untuk memproteksi rute berdasarkan role
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    // Jika role tidak sesuai, kembalikan ke halaman utama sesuai role
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'petugas') return <Navigate to="/petugas/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#111827',
              padding: '16px 20px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
              border: '1px solid #f3f4f6'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            },
          }} 
        />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          {/* Pencari Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/report-lost" element={<LostReport />} />
          <Route path="/my-reports" element={<MyReports />} />
          
          {/* Petugas Routes */}
          <Route path="/petugas/dashboard" element={<ProtectedRoute allowedRoles={['petugas']}><PetugasDashboard /></ProtectedRoute>} />
          <Route path="/petugas/input" element={<ProtectedRoute allowedRoles={['petugas']}><InputFoundItem /></ProtectedRoute>} />
          <Route path="/petugas/reports" element={<ProtectedRoute allowedRoles={['petugas']}><ReportList /></ProtectedRoute>} />
          <Route path="/petugas/reports/:id" element={<ProtectedRoute allowedRoles={['petugas']}><ReportDetail /></ProtectedRoute>} />
          <Route path="/petugas/history" element={<ProtectedRoute allowedRoles={['petugas']}><HandoverHistory /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={['admin']}><CreateUser /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><UserDetail /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLog /></ProtectedRoute>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Shared Routes */}
          <Route path="/profile" element={<ProtectedRoute allowedRoles={[]}><Profile /></ProtectedRoute>} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
