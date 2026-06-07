import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

import { Applications } from './pages/merchants/Applications';
import { Recommendations } from './pages/merchants/Recommendations';
import { Contracts } from './pages/merchants/Contracts';

import { Activities } from './pages/operations/Activities';
import { SalesRanking } from './pages/operations/SalesRanking';

import { RentBills } from './pages/finance/RentBills';
import { OverdueManagement } from './pages/finance/OverdueManagement';

import { WorkOrders } from './pages/property/WorkOrders';
import { DispatchSystem } from './pages/property/DispatchSystem';

import { ExecutiveHeatmap } from './pages/executive/ExecutiveHeatmap';
import { RentAdjustment } from './pages/executive/RentAdjustment';

import { PassengerMonitoring } from './pages/system/PassengerMonitoring';
import { PointsMall } from './pages/system/PointsMall';
import { OperationReports } from './pages/system/OperationReports';
import { MessageCenter } from './pages/system/MessageCenter';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/merchants/applications" element={
          <ProtectedRoute allowedRoles={['merchant', 'executive']}>
            <Applications />
          </ProtectedRoute>
        } />
        <Route path="/merchants/recommendations" element={
          <ProtectedRoute allowedRoles={['merchant', 'executive']}>
            <Recommendations />
          </ProtectedRoute>
        } />
        <Route path="/merchants/contracts" element={
          <ProtectedRoute allowedRoles={['merchant', 'executive', 'finance']}>
            <Contracts />
          </ProtectedRoute>
        } />

        <Route path="/operations/activities" element={
          <ProtectedRoute allowedRoles={['operations', 'executive']}>
            <Activities />
          </ProtectedRoute>
        } />
        <Route path="/operations/sales" element={
          <ProtectedRoute allowedRoles={['operations', 'executive']}>
            <SalesRanking />
          </ProtectedRoute>
        } />

        <Route path="/finance/bills" element={
          <ProtectedRoute allowedRoles={['finance', 'executive']}>
            <RentBills />
          </ProtectedRoute>
        } />
        <Route path="/finance/overdue" element={
          <ProtectedRoute allowedRoles={['finance', 'executive']}>
            <OverdueManagement />
          </ProtectedRoute>
        } />

        <Route path="/property/orders" element={
          <ProtectedRoute allowedRoles={['property', 'executive']}>
            <WorkOrders />
          </ProtectedRoute>
        } />
        <Route path="/property/dispatch" element={
          <ProtectedRoute allowedRoles={['property', 'executive']}>
            <DispatchSystem />
          </ProtectedRoute>
        } />

        <Route path="/executive/heatmap" element={
          <ProtectedRoute allowedRoles={['executive']}>
            <ExecutiveHeatmap />
          </ProtectedRoute>
        } />
        <Route path="/executive/adjustment" element={
          <ProtectedRoute allowedRoles={['executive']}>
            <RentAdjustment />
          </ProtectedRoute>
        } />

        <Route path="/system/passenger" element={
          <ProtectedRoute allowedRoles={['executive', 'operations', 'property']}>
            <PassengerMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/system/points" element={
          <ProtectedRoute allowedRoles={['operations', 'executive']}>
            <PointsMall />
          </ProtectedRoute>
        } />
        <Route path="/system/reports" element={
          <ProtectedRoute allowedRoles={['executive', 'finance']}>
            <OperationReports />
          </ProtectedRoute>
        } />
        <Route path="/system/messages" element={
          <ProtectedRoute>
            <MessageCenter />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
