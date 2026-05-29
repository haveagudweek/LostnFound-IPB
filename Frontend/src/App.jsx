import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PagePattern from './components/PagePattern/PagePattern';
import Dashboard from './pages/Dashboard';
import ReportSelection from './pages/ReportSelection';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Toast from './components/Toast/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ItemsPage from './pages/ItemsPage';
import SearchResults from './pages/SearchResults';
import CategoriesPage from './pages/CategoriesPage';
import ItemDetail from './pages/ItemDetail';
import ContactReporter from './pages/ContactReporter';
import ClaimItem from './pages/ClaimItem';
import History from './pages/History';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminReportDetail from './pages/AdminReportDetail';
import AdminPostedItems from './pages/AdminPostedItems';
import AdminClaims from './pages/AdminClaims';
import AdminClaimDetail from './pages/AdminClaimDetail';
import { useAuthStore } from './store/authStore';

/* Routes where Navbar & Footer should be hidden */
const AUTH_ROUTES = ['/login', '/register'];

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { pathname } = useLocation();
  const hideChrome = AUTH_ROUTES.includes(pathname) || pathname.startsWith('/admin');

  return (
    <div className="app" id="app">
      <PagePattern />
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        
        <Route path="/lost" element={<ProtectedRoute><ItemsPage type="lost" /></ProtectedRoute>} />
        <Route path="/found" element={<ProtectedRoute><ItemsPage type="found" /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/contact/:id" element={<ProtectedRoute><ContactReporter /></ProtectedRoute>} />
        <Route path="/claim/:id" element={<ProtectedRoute><ClaimItem /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        
        <Route path="/report" element={<ProtectedRoute><ReportSelection /></ProtectedRoute>} />
        <Route path="/report/lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report/found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/verification" element={<AdminRoute><AdminVerification /></AdminRoute>} />
        <Route path="/admin/verification/:id" element={<AdminRoute><AdminReportDetail /></AdminRoute>} />
        <Route path="/admin/items" element={<AdminRoute><AdminPostedItems /></AdminRoute>} />
        <Route path="/admin/claims" element={<AdminRoute><AdminClaims /></AdminRoute>} />
        <Route path="/admin/claims/:id" element={<AdminRoute><AdminClaimDetail /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideChrome && <Footer />}
      <Toast />
    </div>
  );
}

export default App;
