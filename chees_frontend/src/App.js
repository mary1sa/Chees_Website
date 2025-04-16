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
import CourseProgress from './Components/Courses/CourseProgress';
import CourseWishlist from './Components/Courses/CourseWishlist';
import PurchasedCourses from './Components/Courses/PurchasedCourses';

// Course Package Components - Temporarily commented out
// import CoursePackageList from './Components/Courses/Packages/CoursePackageList';
// import CoursePackageDetail from './Components/Courses/Packages/CoursePackageDetail';
// import CoursePackagePurchase from './Components/Courses/Packages/CoursePackagePurchase';
// import MyPackages from './Components/Courses/Packages/MyPackages';

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
import CourseContent from './Components/MemberDashboard/CourseContent/CourseContent';
import MemberCourseMaterials from './Components/MemberDashboard/CourseContent/MemberCourseMaterials';
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
import CoachSpecialization from './Components/SpecializationCoatch/SpecializationCoach';
// Import other event components as needed

import CourseList from './Components/AdminDashboard/CourseManagement/CourseList';
import CourseForm from './Components/AdminDashboard/CourseManagement/CourseForm';
import LevelList from './Components/AdminDashboard/CourseLevelManagement/LevelList';
import LevelForm from './Components/AdminDashboard/CourseLevelManagement/LevelForm';

import AdminDashboardOverview from './Components/AdminDashboard/AdminDashboardOverview';

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
          
          {/* Bookstore Management Routes */}
          <Route path="books" element={<BookList />} />
          <Route path="books/create" element={<AddBook />} />
          <Route path="authors" element={<AuthorList />} />
          <Route path="orders" element={<OrdersList />} />
          
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
          <Route path="courses/progress" element={<CourseProgress />} />
          <Route path="courses/wishlist" element={<CourseWishlist />} />
          <Route path="courses/purchased" element={<PurchasedCourses />} />

          <Route path="course-content" element={<CourseContent />} />
          <Route path="course-materials" element={<MemberCourseMaterials />} />
          <Route path="course-materials/:courseId" element={<MemberCourseMaterials />} />
          
          {/* Course Package Routes - Temporarily commented out */}
          {/* <Route path="packages" element={<CoursePackageList />} />
          <Route path="packages/:id" element={<CoursePackageDetail />} />
          <Route path="packages/:id/purchase" element={<CoursePackagePurchase />} />
          <Route path="packages/purchased" element={<MyPackages />} /> */}
          
          {/* Session Routes */}
          <Route path="upcoming-sessions" element={<UpcomingSessions />} />
          <Route path="my-schedule" element={<UpcomingSessions />} /> {/* Reusing UpcomingSessions component */}

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