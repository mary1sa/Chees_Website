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
import MemberCourseMaterials from './Components/MemberDashboard/CourseContent/MemberCourseMaterials';
import CoachCourseCatalog from './Components/CoatchDashboard/Courses/CoachCourseCatalog';
import CoachCourseDetail from './Components/CoatchDashboard/Courses/CoachCourseDetail';
import PurchasedCourses from './Components/Courses/PurchasedCourses';
// import CourseProgress from './Components/Courses/CourseProgress';
import CourseWishlist from './Components/Courses/CourseWishlist';

// Session Management Components
import SessionManagement from './Components/AdminDashboard/SessionManagement/SessionManagement';
import SessionScheduler from './Components/AdminDashboard/SessionManagement/SessionScheduler';
import AttendanceTracker from './Components/AdminDashboard/SessionManagement/AttendanceTracker';
import RecordingUploader from './Components/AdminDashboard/SessionManagement/RecordingUploader';

// Course Material Components
import CourseMaterialList from './Components/AdminDashboard/CourseMaterialManagement/CourseMaterialList';
import CourseMaterialForm from './Components/AdminDashboard/CourseMaterialManagement/CourseMaterialForm';
import CourseMaterialView from './Components/AdminDashboard/CourseMaterialManagement/CourseMaterialView';

// Member Dashboard Components
import UpcomingSessions from './Components/MemberDashboard/UpcomingSessions/UpcomingSessions';
import CoachUpcomingSessions from './Components/CoatchDashboard/UpcomingSessions/CoachUpcomingSessions';
import CoachDashboardOverview from './Components/CoatchDashboard/CoachDashboardOverview';
import MemberDashboardOverview from './Components/MemberDashboard/MemberDashboardOverview';

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

import CourseList from './Components/AdminDashboard/CourseManagement/CourseList';
import CourseForm from './Components/AdminDashboard/CourseManagement/CourseForm';
import LevelList from './Components/AdminDashboard/CourseLevelManagement/LevelList';
import LevelForm from './Components/AdminDashboard/CourseLevelManagement/LevelForm';
import AdminDashboardOverview from './Components/AdminDashboard/AdminDashboardOverview';
import CreateCoacheProfile from './Components/Coatches/Coches/CreateCoacheProfile';
import UpdateCoach from './Components/Coatches/Admin/UpdateCoach';
import CreateCoachAvailability from './Components/Coatches/Coches/CreateCoachAvailability';
import CoachAvailability from './Components/Coatches/Coches/CoachAvailability';
import UpdateCoachAvailability from './Components/Coatches/Coches/UpdateCoachAvailability';
import ViewAuthor from './Components/BookStore/ViewAuthor';
import EditAuthor from './Components/BookStore/EditAuthor';
import AddAuthor from './Components/BookStore/AddAuthor';
import CreateOrder from './Components/BookStore/CreateOrder';
import UserAvailabilities from './Components/Coatches/Member/UserAvailabilities';
import AdminCoachAvailability from './Components/Coatches/Admin/AdminCoachAvailability';
import AdminCreateAvailability from './Components/Coatches/Admin/AdminCreateAvailability';
import AdminUpdateAvailability from './Components/Coatches/Admin/AdminUpdateAvailability';

import CoachReviewForm from './Components/Coatches/Member/CoachReviewForm';
import CoachReviews from './Components/Coatches/Coches/CoachReviews';

import Books from './Components/MemberDashboard/BookStor/Books';
import BookDetail from './Components/MemberDashboard/BookStor/BookDetail';
import OrderForm from './Components/MemberDashboard/BookStor/OrderForm';
import BookStoreDashboard from './Components/BookStore/BookStoreDashboard';
import Authors from './Components/MemberDashboard/BookStor/Authors';
import MemberOrders from './Components/MemberDashboard/BookStor/MemberOrders';
import OrderDetails from './Components/MemberDashboard/BookStor/OrderDetails';
import ReviewTable from './Components/Coatches/Admin/ReviewTable';
import ProfileCoach from './Components/CoatchDashboard/ProfileCoach';
import UpdateCoachProfile from './Components/CoatchDashboard/UpdateCoachProfile';
import BookWishlist from './Components/MemberDashboard/BookStor/BookWishlist';
import UpdateCoachPers from './Components/CoatchDashboard/UpdateCoachPers';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}

        {/* Admin Routes */}
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
          <Route path="books/dashboard" element={<BookStoreDashboard />} />



          
          {/* Event Management Routes */}
          <Route path="events" element={<EventList />} />
          <Route path="events/types" element={<EventTypes />} />
          <Route path="events/registrations" element={<AdminEventRegistrations />} />
          
          {/* Session Management Routes */}
          <Route path="sessions" element={<SessionManagement />} />
          <Route path="sessions/schedule" element={<SessionScheduler />} />
          <Route path="sessions/edit/:sessionId" element={<SessionScheduler isEditing={true} />} />
          <Route path="sessions/attendance" element={<AttendanceTracker />} />
          <Route path="sessions/recordings" element={<RecordingUploader />} />
          
          {/* Course Management Routes */}
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/create" element={<CourseForm />} />
          <Route path="courses/:courseId/edit" element={<CourseForm isEditing={true} />} />
          <Route path="courses/:courseId" element={<CourseForm isEditing={true} isViewOnly={true} />} />
          <Route path="levels" element={<LevelList />} />
          <Route path="levels/create" element={<LevelForm isEditing={false} />} />
          <Route path="levels/:levelId/edit" element={<LevelForm isEditing={true} />} />
          
          {/* Course Materials Management Routes */}
          <Route path="course-materials" element={<CourseMaterialList />} />
          <Route path="course-materials/create" element={<CourseMaterialForm />} />
          <Route path="course-materials/:materialId/edit" element={<CourseMaterialForm isEditing={true} />} />
          <Route path="course-materials/:materialId/view" element={<CourseMaterialView />} />
          
          {/* Roles Management Routes */}
          <Route path="roles" element={<Roles />} />
          
          {/* Coach Management Routes */}
          <Route path="CoachSpecialization" element={<CoachSpecialization />} />
          <Route path="FetchCoatches" element={<FetchCoaches />} />
          <Route path="CreateCoatch" element={<CreateCoach />} />
          <Route path="updatecoach/:id" element={<UpdateCoach />} />
          <Route path="RequestPending" element={<PendingRequestsTable />} />
          <Route path="coachavailability" element={<AdminCoachAvailability />} />
          <Route path="creatavailability" element={<AdminCreateAvailability />} />
          <Route path="updateavailability/:id" element={<AdminUpdateAvailability/>} />
          {/* review table */}
          <Route path="reviewTable" element={<ReviewTable />} />

          {/* Default Route */}
          <Route index element={<AdminDashboardOverview />} />
        </Route>
        
        {/* Frontend Routes */}
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
          <Route path="courses" element={<CourseCatalog />} /> {/* Added this route to fix navigation */}
          <Route path="courses/catalog" element={<CourseCatalog />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          {/* <Route path="courses/progress" element={<CourseProgress />} /> */}
          <Route path="courses/wishlist" element={<CourseWishlist />} />
          <Route path="courses/purchased" element={<PurchasedCourses />} />

          <Route path="course-materials" element={<MemberCourseMaterials />} />
          <Route path="course-materials/:courseId" element={<MemberCourseMaterials />} />
          
          {/* book store routes */}
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="books/:id/order" element={<OrderForm />} />
          <Route path="authors" element={<Authors />} />
          <Route path="myOrderes" element={<MemberOrders/>} />
          <Route path="authors/:id" element={<ViewAuthor/>} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="books/wishlist" element={<BookWishlist />} />

          {/* Session Routes */}
          <Route path="upcoming-sessions" element={<UpcomingSessions />} />
          {/* Coach Booking Route */}
          <Route path="bookingcoach" element={<UserAvailabilities />} />
          <Route path="CoachReviewForm" element={<CoachReviewForm />} />

          {/* Default Route */}
          <Route index element={<MemberDashboardOverview />} />
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

  {/* <Route path="CreateProfile" element={< CreateCoacheProfile />} />
  <Route path="creatavailability" element={<  CreateCoachAvailability />} />
  <Route path="coachavailability" element={<  CoachAvailability />} />
  <Route path="Updateavailability/:id" element={<  UpdateCoachAvailability />} /> */}
  <Route path="coachReviews" element={< CoachReviews />} />
  <Route path="profileCoach" element={< ProfileCoach />} />



  <Route path="CreateProfile" element={<CreateCoacheProfile />} />
  <Route path="UpdateCoachProfile/:id" element={<UpdateCoachProfile />} />
  <Route path="UpdateCoachPers" element={<UpdateCoachPers />} />

  <Route path="creatavailability" element={<CreateCoachAvailability />} />
  <Route path="coachavailability" element={<CoachAvailability />} />
  <Route path="Updateavailability/:id" element={<UpdateCoachAvailability />} />
  <Route path="upcoming-sessions" element={<CoachUpcomingSessions />} />
  <Route path="payments" element={<div>Coach Payments</div>} />
  <Route path="invoices" element={<div>Coach Invoices</div>} />
  <Route path="settings" element={<div>Coach Settings</div>} />
  
  {/* Course Content Routes */}
  <Route path="courses" element={<CoachCourseCatalog />} />
  <Route path="courses/:courseId" element={<CoachCourseDetail />} />
  <Route path="course-materials" element={<MemberCourseMaterials />} />
  <Route path="course-materials/:courseId" element={<MemberCourseMaterials />} />
  <Route index element={<CoachDashboardOverview />} />

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