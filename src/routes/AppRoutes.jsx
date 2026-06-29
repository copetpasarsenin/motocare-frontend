import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import DashboardLayout from '../components/templates/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

const BookingCreate = lazy(() => import('../pages/BookingCreate'))
const BookingsList = lazy(() => import('../pages/BookingsList'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Profile = lazy(() => import('../pages/Profile'))
const Register = lazy(() => import('../pages/Register'))
const ServiceCreate = lazy(() => import('../pages/ServiceCreate'))
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'))
const ServiceEdit = lazy(() => import('../pages/ServiceEdit'))
const ServicesList = lazy(() => import('../pages/ServicesList'))

function RouteLoading() {
  return <div className="route-loading" role="status">Memuat halaman...</div>
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="services" element={<ServicesList />} />
            <Route path="services/:id" element={<ServiceDetail />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="profile" element={<Profile />} />

            <Route element={<ProtectedRoute allowedRoles={['user']} redirectTo="/bookings" />}>
              <Route path="bookings/create" element={<BookingCreate />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="services/create" element={<ServiceCreate />} />
              <Route path="services/:id/edit" element={<ServiceEdit />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes



