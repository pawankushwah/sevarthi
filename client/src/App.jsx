import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerHome from './pages/customer/Home';
import BookRide from './pages/customer/BookRide';
import ActiveBooking from './pages/customer/ActiveBooking';
import Payment from './pages/customer/Payment';
import Wallet from './pages/customer/Wallet';
import History from './pages/customer/History';
import ProviderHome from './pages/provider/Home';
import ActiveJob from './pages/provider/ActiveJob';
import Earnings from './pages/provider/Earnings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProviders from './pages/admin/Providers';
import AdminServices from './pages/admin/Services';
import AdminReviews from './pages/admin/Reviews';
import Profile from './pages/Profile';
import EditProfile from './pages/profile/EditProfile';
import Notifications from './pages/profile/Notifications';
import Support from './pages/profile/Support';
import DemoSetup from './pages/DemoSetup';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/profile" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<DemoSetup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Customer */}
      <Route path="/" element={
        <ProtectedRoute roles={['customer']}>
          <CustomerHome />
        </ProtectedRoute>
      } />
      <Route path="/book" element={<ProtectedRoute roles={['customer']}><BookRide /></ProtectedRoute>} />
      <Route path="/booking/:id" element={<ProtectedRoute roles={['customer']}><ActiveBooking /></ProtectedRoute>} />
      <Route path="/payment/:id" element={<ProtectedRoute roles={['customer']}><Payment /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute roles={['customer']}><Wallet /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute roles={['customer']}><History /></ProtectedRoute>} />

      {/* Provider */}
      <Route path="/provider" element={<ProtectedRoute roles={['provider']}><ProviderHome /></ProtectedRoute>} />
      <Route path="/provider/job/:id" element={<ProtectedRoute roles={['provider']}><ActiveJob /></ProtectedRoute>} />
      <Route path="/provider/earnings" element={<ProtectedRoute roles={['provider']}><Earnings /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/providers" element={<ProtectedRoute roles={['admin']}><AdminProviders /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute roles={['admin']}><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/profile" element={
        <ProtectedRoute roles={['customer', 'provider', 'admin']}>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/profile/edit" element={
        <ProtectedRoute roles={['customer', 'provider', 'admin']}>
          <EditProfile />
        </ProtectedRoute>
      } />
      <Route path="/profile/notifications" element={
        <ProtectedRoute roles={['customer', 'provider', 'admin']}>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/profile/support" element={
        <ProtectedRoute roles={['customer', 'provider', 'admin']}>
          <Support />
        </ProtectedRoute>
      } />

      <Route path="/demo" element={<DemoSetup />} />
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
