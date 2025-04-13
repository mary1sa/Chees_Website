
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

// Session Management Components
import SessionManagement from './Components/AdminDashboard/SessionManagement/SessionManagement';
import SessionScheduler from './Components/AdminDashboard/SessionManagement/SessionScheduler';

// Member Dashboard Components
import UpcomingSessions from './Components/MemberDashboard/UpcomingSessions/UpcomingSessions';
import CourseContent from './Components/MemberDashboard/CourseContent/CourseContent';

import EventTypes from './Components/Event/EventTypes/EventTypes';
import EventList from './Components/Event/Events/EventList';
import AdminEventRegistrations from './Components/Event/Registration/Admin/AdminEventRegistrations';
import UserEventRegistrations from './Components/Event/Registration/User/UserEventRegistrations';
import TournamentRoundsManager from './Components/Event/Events/TournamentRoundsManager';
import TournamentMatchesManager from './Components/Event/Events/TournamentMatchesManager';
import BookList from './Components/BookStore/BookList';
import AddBook from './Components/BookStore/AddBook';
import AuthorList from './Components/BookStore/AuthorList';
import OrdersList from './Components/BookStore/OrdersList';
import Roles from './Components/Roles/Roles';
import CoachSpecialization from './Components/Coatches/SpecializationCoach';
import FetchCoaches from './Components/Coatches/Admin/FetchCoatches';
import PendingRequestsTable from './Components/Coatches/PendingRequestsTable';
import CreateCoach from './Components/Coatches/Admin/CreateCoatch';
// Import other event components as needed

import CourseList from './Components/AdminDashboard/CourseManagement/CourseList';
import CourseForm from './Components/AdminDashboard/CourseManagement/CourseForm';
import LevelList from './Components/AdminDashboard/CourseLevelManagement/LevelList';
import LevelForm from './Components/AdminDashboard/CourseLevelManagement/LevelForm';
import EnrollmentList from './Components/AdminDashboard/EnrollmentManagement/EnrollmentList';
import EnrollmentForm from './Components/AdminDashboard/EnrollmentManagement/EnrollmentForm';
import CreateCoacheProfile from './Components/Coatches/Coches/CreateCoacheProfile';
import UpdateCoach from './Components/Coatches/Admin/UpdateCoach';
import CreateCoachAvailability from './Components/Coatches/Coches/CreateCoachAvailability';
import CoachAvailability from './Components/Coatches/Coches/CoachAvailability';
import UpdateCoachAvailability from './Components/Coatches/Coches/UpdateCoachAvailability';
import ViewAuthor from './Components/BookStore/ViewAuthor';
import EditAuthor from './Components/BookStore/EditAuthor';
import AddAuthor from './Components/BookStore/AddAuthor';
import CreateOrder from './Components/BookStore/CreateOrder';

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

          {/* Bookstore Management (moved here) */}
          <Route path="books" element={<BookList />} />
          <Route path="books/create" element={<AddBook />} />
          <Route path="authors" element={<AuthorList />} />
          <Route path="authors/show/:id" element={<ViewAuthor />} />
          <Route path="authors/edit/:id" element={<EditAuthor />} />
          <Route path="authors/create" element={<AddAuthor />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/create" element={<CreateOrder />} />


          
          {/* Event Management Routes */}
          <Route path="events" element={<EventList />} />
          <Route path="events/types" element={<EventTypes />} />
          <Route path="events/registrations" element={<AdminEventRegistrations />} />
          
          {/* Session Management Routes */}
          <Route path="sessions" element={<SessionManagement />} />
          <Route path="sessions/edit/:sessionId" element={<SessionScheduler isEditing={true} />} />
          <Route path="sessions/scheduler" element={<SessionScheduler />} />
          
          {/* Course Management Routes */}
          <Route path="courses" element={<CourseList />} />
          <Route path="createcourse" element={<CourseForm />} />
          <Route path="courses/edit/:courseId" element={<CourseForm isEditing={true} />} />
          <Route path="courses/:courseId" element={<CourseForm isEditing={true} isViewOnly={true} />} />
          <Route path="levels" element={<LevelList />} />
          <Route path="createlevel" element={<LevelForm isEditing={false} />} />
          <Route path="levels/edit/:levelId" element={<LevelForm isEditing={true} />} />
          <Route path="enrollments" element={<EnrollmentList />} />
          <Route path="createenrollment" element={<EnrollmentForm isEditing={false} />} />
          <Route path="enrollments/edit/:enrollmentId" element={<EnrollmentForm isEditing={true} />} />
       


          
          
       {/* Roles Management Routes */}
       <Route path="roles" element={<Roles />} />
          {/*Coatch Management Routes */}
          <Route path="CoachSpecialization" element={<CoachSpecialization />} />
          <Route path="FetchCoatches" element={<FetchCoaches />} />
          <Route path="CreateCoatch" element={<CreateCoach />} />
          <Route path="updatecoach/:id" element={<UpdateCoach />} />

          <Route path="RequestPending" element={<PendingRequestsTable />} />

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
          <Route path="course-content" element={<CourseContent />} />
          
          {/* Session Routes */}
          <Route path="upcoming-sessions" element={<UpcomingSessions />} />
          <Route path="my-schedule" element={<UpcomingSessions />} /> {/* Reusing UpcomingSessions component */}
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
  <Route path="CreateProfile" element={< CreateCoacheProfile />} />
  <Route path="creatavailability" element={<  CreateCoachAvailability />} />
  <Route path="coachavailability" element={<  CoachAvailability />} />
  <Route path="Updateavailability/:id" element={<  UpdateCoachAvailability />} />


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