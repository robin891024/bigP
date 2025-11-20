import Headbar from './component/Headbar'
import Footbar from './component/Footbar'
import Login from './component/Login'
import Register from './component/Register'
import MemberPage from './component/MemberPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './component/ProtectedRoute'

function App() {

  return (
    <BrowserRouter>
      <Headbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/member" 
          element={<ProtectedRoute>
            <MemberPage />
          </ProtectedRoute>} />
      </Routes>
      <Footbar />
    </BrowserRouter>
  );
}

export default App
