import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';


import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import MemberDashboard from './Components/MemberDashboard/MemberDashboard';
import CoatchDashboard from './Components/CoatchDashboard/CoatchDashboard';

import Home from './Components/VisiteurPage/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import MemberProfile from './Components/MemberDashboard/MemberProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
         </Route>
        
        <Route path="/member/dashboard" element={<ProtectedRoute roles={['member']}><MemberDashboard /></ProtectedRoute>}>
          <Route path="profile" element={<MemberProfile />} />
        
        </Route>


<Route
          path="/coatch/dashboard"
          element={
            <ProtectedRoute roles={['coatch']}>
              <CoatchDashboard />
            </ProtectedRoute>
          }
        >
         </Route>


         
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        
      </Routes>
    </Router>
  );
}

export default App;