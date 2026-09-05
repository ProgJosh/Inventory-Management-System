import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen, Toasts } from './components/ui';
import { useInventory } from './context/InventoryContext';
import { canViewAudit } from './services/inventoryService';
import { AuditLogPage } from './pages/AuditLogPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UsersPage } from './pages/UsersPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { RegisterPage } from './pages/RegisterPage';

function ProtectedLayout() {
  const { user } = useInventory();
  return user ? <AppLayout /> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useInventory();
  return user && canViewAudit(user.role) ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { loading } = useInventory();
  if (loading) return <LoadingScreen />;
  return <><Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route element={<ProtectedLayout />}><Route index element={<DashboardPage />} /><Route path="products" element={<ProductsPage />} /><Route path="transactions" element={<TransactionsPage />} /><Route path="suppliers" element={<SuppliersPage />} /><Route path="categories" element={<CategoriesPage />} /><Route path="reports" element={<ReportsPage />} /><Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} /><Route path="audit-log" element={<AdminRoute><AuditLogPage /></AdminRoute>} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes><Toasts /></>;
}
