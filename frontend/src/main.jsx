import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Search from './pages/Search.jsx'
import Customers from './pages/Customers.jsx'
import CustomerForm from './pages/CustomerForm.jsx'
import Rooms from './pages/Rooms.jsx'
import RoomForm from './pages/RoomForm.jsx'
import Bookings from './pages/Bookings.jsx'
import BookingForm from './pages/BookingForm.jsx'
import './style.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/new" element={<RoomForm />} />
          <Route path="/rooms/:id/edit" element={<RoomForm />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/new" element={<BookingForm />} />
          <Route path="/bookings/:id/edit" element={<BookingForm />} />
          <Route path="/bookings/search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
