
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Players from './pages/Players';
import Matches from './pages/Matches';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Tickets from './pages/Tickets';
import Shop from './pages/Shop';
import ShopDetails from './pages/ShopDetails';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import Membership from './pages/Membership';
import ScrollToTop from './components/ScrollToTop';
import SplashScreen from './components/SplashScreen';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import ManagePlayers from './pages/Admin/ManagePlayers';
import ManageMatches from './pages/Admin/ManageMatches';
import ManageNews from './pages/Admin/ManageNews';
import ManageShop from './pages/Admin/ManageShop';
import ManageTickets from './pages/Admin/ManageTickets';
import ManageContacts from './pages/Admin/ManageContacts';
import ManageTicketSettings from './pages/Admin/ManageTicketSettings';
import ManageOrders from './pages/Admin/ManageOrders';
import ProfileSettings from './pages/Admin/ProfileSettings';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import DesignSystemShowcase from './pages/DesignSystemShowcase';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <>
      <SplashScreen />
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/design-system" element={<DesignSystemShowcase />} />
            <Route path="/players" element={<MainLayout><Players /></MainLayout>} />
            <Route path="/matches" element={<MainLayout><Matches /></MainLayout>} />
            <Route path="/news" element={<MainLayout><News /></MainLayout>} />
            <Route path="/news/:id" element={<MainLayout><NewsDetail /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            <Route path="/tickets" element={<MainLayout><Tickets /></MainLayout>} />
            <Route path="/membership" element={<MainLayout><Membership /></MainLayout>} />
            <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
            <Route path="/shop/cart" element={<MainLayout><CartPage /></MainLayout>} />
            <Route path="/shop/wishlist" element={<MainLayout><WishlistPage /></MainLayout>} />
            <Route path="/shop/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
            <Route path="/shop/track" element={<MainLayout><TrackOrderPage /></MainLayout>} />
            <Route path="/shop/:id" element={<MainLayout><ShopDetails /></MainLayout>} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="players" element={<ManagePlayers />} />
                <Route path="matches" element={<ManageMatches />} />
                <Route path="news" element={<ManageNews />} />
                <Route path="shop" element={<ManageShop />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="tickets" element={<ManageTickets />} />
                <Route path="settings/tickets" element={<ManageTicketSettings />} />
                <Route path="contacts" element={<ManageContacts />} />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
