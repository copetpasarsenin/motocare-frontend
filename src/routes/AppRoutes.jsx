import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '../components/layout/DashboardLayout'
import BookingCreate from '../pages/BookingCreate'
import BookingsList from '../pages/BookingsList'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import Profile from '../pages/Profile'
import Register from '../pages/Register'
import ServiceCreate from '../pages/ServiceCreate'
import ServiceDetail from '../pages/ServiceDetail'
import ServiceEdit from '../pages/ServiceEdit'
import ServicesList from '../pages/ServicesList'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="services/create" element={<ServiceCreate />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/:id/edit" element={<ServiceEdit />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="bookings/create" element={<BookingCreate />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
