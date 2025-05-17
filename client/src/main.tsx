import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './pages/DashboardLayout'
import UserDashboard from './pages/UserDashboard'
import MyWheels from './pages/MyWheels'
import UseWheel from './pages/UseWheel'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="800538480516-81pub88oefq7osi3ubio9h3p33h2ii9b.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="my-wheels" element={<MyWheels />} />
            <Route path="wheel/:id" element={<UseWheel />} />
          </Route>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
