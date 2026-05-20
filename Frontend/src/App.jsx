import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
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
import ItemDetail from './pages/ItemDetail';
import ContactReporter from './pages/ContactReporter';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminReportDetail from './pages/AdminReportDetail';
import AdminClaims from './pages/AdminClaims';
import AdminClaimDetail from './pages/AdminClaimDetail';

/* Routes where Navbar & Footer should be hidden */
const AUTH_ROUTES = ['/login', '/register'];

function App() {
  const { pathname } = useLocation();
  const hideChrome = AUTH_ROUTES.includes(pathname) || pathname.startsWith('/admin');

  return (
    <div className="app" id="app">
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/lost" element={<ItemsPage type="lost" />} />
        <Route path="/found" element={<ItemsPage type="found" />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/contact/:id" element={<ContactReporter />} />
        
        <Route path="/report" element={<ReportSelection />} />
        <Route path="/report/lost" element={<ReportLost />} />
        <Route path="/report/found" element={<ReportFound />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/verification" element={<AdminVerification />} />
        <Route path="/admin/verification/:id" element={<AdminReportDetail />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/claims/:id" element={<AdminClaimDetail />} />
      </Routes>
      {!hideChrome && <Footer />}
      <Toast />
    </div>
  );
}

export default App;
