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
import FetchUsers from './Components/AdminDashboard/FetchUsers';
import ShowUser from './Components/AdminDashboard/ShowUser';
import UpdateUser from './Components/AdminDashboard/UpdateUser';
import CreateUser from './Components/AdminDashboard/CreateUser';

import EventTypes from './Components/Event/EventTypes/EventTypes';
import EventList from './Components/Event/Events/EventList';
// import EventRegistration from './Components/Event/Registration/User/Registration';
import AdminEventRegistrations from './Components/Event/Registration/Admin/AdminEventRegistrations';
// import TournamentRoundsManager from './Components/Event/Events/TournamentRoundsManager';

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

         <Route path="fetchusers" element={<FetchUsers />} />
         <Route path="createuser" element={<CreateUser />} />

         <Route path="updateuser/:id" element={<UpdateUser />} />

         <Route path="showuser/:id" element={<ShowUser />} />
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
        <Route
          path='/EventTypes'
          element={<EventTypes />}

        >
        </Route>
        <Route
          path='/EventList'
          element={<EventList />}

        >
        </Route>
        {/* <Route
          path='/EventRegistration'
          element={<EventRegistration />}

        >
        </Route> */}
        <Route
          path='/AdminEventRegistrations'
          element={<AdminEventRegistrations />}

        >
        </Route>
        {/* <Route
          path='/TournamentRoundsManager'
          element={<TournamentRoundsManager />}

        >
        </Route> */}

      </Routes>
    </Router>
  );
}

export default App;