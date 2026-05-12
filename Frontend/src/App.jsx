import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Dashboard from './pages/Dashboard';
import ReportSelection from './pages/ReportSelection';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Toast from './components/Toast/Toast';

// Missing pages
import Login from './pages/Login';
import Register from './pages/Register';
import ItemsPage from './pages/ItemsPage';
import ItemDetail from './pages/ItemDetail';
import ContactReporter from './pages/ContactReporter';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';

function App() {
  return (
    <div className="app" id="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/lost" element={<ItemsPage type="lost" />} />
        <Route path="/found" element={<ItemsPage type="found" />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/contact/:id" element={<ContactReporter />} />
        
        <Route path="/report" element={<ReportSelection />} />
        <Route path="/report/lost" element={<ReportLost />} />
        <Route path="/report/found" element={<ReportFound />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/verification" element={<AdminVerification />} />
      </Routes>
      <Footer />
      <Toast />
    </div>
  );
}

export default App;
