
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

// Course Components
import CourseCatalog from './Components/Courses/CourseCatalog';
import CourseDetail from './Components/Courses/CourseDetail';
import EnrolledCourses from './Components/Courses/EnrolledCourses';
import CourseProgress from './Components/Courses/CourseProgress';
import CourseWishlist from './Components/Courses/CourseWishlist';

import EventTypes from './Components/Event/EventTypes/EventTypes';
import EventList from './Components/Event/Events/EventList';
import AdminEventRegistrations from './Components/Event/Registration/Admin/AdminEventRegistrations';
import UserEventRegistrations from './Components/Event/Registration/User/UserEventRegistrations';
import TournamentRoundsManager from './Components/Event/Events/TournamentRoundsManager';
import TournamentMatchesManager from './Components/Event/Events/TournamentMatchesManager';
import Roles from './Components/Roles/Roles';
import CoachSpecialization from './Components/SpecializationCoatch/SpecializationCoach';
// Import other event components as needed

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
          {/* User Management Routes */}
          <Route path="fetchusers" element={<FetchUsers />} />
          <Route path="createuser" element={<CreateUser />} />
          <Route path="updateuser/:id" element={<UpdateUser />} />
          <Route path="showuser/:id" element={<ShowUser />} />
          
          {/* Event Management Routes */}
          <Route path="events" element={<EventList />} />
          <Route path="events/types" element={<EventTypes />} />
          <Route path="events/registrations" element={<AdminEventRegistrations />} />
       {/* Roles Management Routes */}
       <Route path="roles" element={<Roles />} />
          {/*Coatch Management Routes */}
          <Route path="CoachSpecialization" element={<CoachSpecialization />} />

        </Route>

        <Route 
          path="/member/dashboard"
          element={
            <ProtectedRoute roles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          }>
          <Route path="registrations" element={<UserEventRegistrations />} />

        
          <Route path="profile" element={<MemberProfile />} />
          {/* Course Routes */}
          <Route path="courses/catalog" element={<CourseCatalog />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="courses/enrolled" element={<EnrolledCourses />} />
          <Route path="courses/progress" element={<CourseProgress />} />
          <Route path="courses/wishlist" element={<CourseWishlist />} />
        </Route>

        <Route 
          path="/member/dashboard"
          element={
            <ProtectedRoute roles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        >
                    <Route path="registrations" element={<UserEventRegistrations />} />

          <Route path="profile" element={<MemberProfile />} />
          {/* Course Routes */}
          <Route path="courses/catalog" element={<CourseCatalog />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="courses/enrolled" element={<EnrolledCourses />} />
          <Route path="courses/progress" element={<CourseProgress />} />
          <Route path="courses/wishlist" element={<CourseWishlist />} />
        </Route>

        <Route
  path="/coach/dashboard"
  element={
    <ProtectedRoute roles={['coach']}>
      <CoatchDashboard />
    </ProtectedRoute>
  }
>
  <Route path="registrations" element={<UserEventRegistrations />} />
</Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Remove these standalone event routes as they're now nested under admin dashboard */}
        {/* <Route path='/EventTypes' element={<EventTypes />} /> */}
        {/* <Route path='/EventList' element={<EventList />} /> */}
        {/* <Route path='/AdminEventRegistrations' element={<AdminEventRegistrations />} /> */}
      </Routes>
    </Router>
  );
}


export default App;