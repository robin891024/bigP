import Login from './component/Login'
import Register from './component/Register'
import MemberPage from './component/MemberPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './component/ProtectedRoute'
import GoogleRegister from './component/GoogleRegister'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/googleRegister' element={<GoogleRegister />} />
        <Route path="/member/*"
          element={<ProtectedRoute>
            <MemberPage />
          </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
