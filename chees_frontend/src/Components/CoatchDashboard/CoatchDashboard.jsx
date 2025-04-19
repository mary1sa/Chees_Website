
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUserPlus,
  FiDollarSign, FiCalendar, FiSettings, FiKey,
  FiLogOut, FiBell, FiSearch, FiSun, FiMoon,
  FiChevronDown, FiChevronRight, FiChevronLeft,
  FiCreditCard, FiFileText, FiList,
  FiAward, FiBook,FiStar
} from 'react-icons/fi';
import '../AdminDashboard/AdminDashboard.css';

const CoatchDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();
  const location = useLocation();

  const adminData = {
    name: "Admin Name",
    avatar: "/admin-avatar.jpg",
    role: "Super Admin"
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);

      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FiHome />,
      path: "/coach/dashboard"
    },
    {
      title: "profile Coach",
      icon: <FiUsers />,
      path: "profileCoach"
    },
    {
      title: "Upcoming Sessions",
      icon: <FiCalendar />,
      path: "/coach/dashboard/upcoming-sessions"
    },
    {
      title: "Course Content",
      icon: <FiFileText />,
      submenus: [
        {
          title: "All Courses",
          path: "courses",
          icon: <FiBook className="submenu-icon" />
        },
      ]
    },
    { 
      title: "Add Coach", 
      path: "CreateProfile",
      icon: <FiUserPlus className="submenu-icon" />
    },
    {
      title: "Coach Availability",
      icon: <FiUsers />,
      submenus: [
        {
          title: "View Availability",
          path: "coachavailability",
          icon: <FiList className="submenu-icon" />
        },
        {
          title: "Create Availability",
          path: "creatavailability",
          icon: <FiList className="submenu-icon" />
        }
      ]
    },
    {
      title: "Registrations",
      path: "registrations",  
      icon: <FiAward className="submenu-icon" />
    }, 
    {
      title: "Financial",
      icon: <FiDollarSign />,
      submenus: [
        {
          title: "Payments",
          path: "/coach/dashboard/payments",
          icon: <FiCreditCard className="submenu-icon" />
        },
        {
          title: "Invoices",
          path: "/coach/dashboard/invoices",
          icon: <FiFileText className="submenu-icon" />
        }
      ]
    },
    {
      title: "CoachReview",
      icon:<FiStar />,
      path: "coachReviews"
    },
    {
      title: "Settings",
      icon: <FiSettings />,
      path: "/coach/dashboard/settings"
    }
  ];

  return (
    <div className={`admin-container ${darkMode ? 'dark' : ''}`}>
      <nav className={`admin-navbar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="navbar-left">
          {isMobile && (
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
              <FiMenu />
            </button>
          )}
          <h1 className="brand-name">Coach Panel</h1>
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          <div className="notifications-wrapper">
            <button className="notifications">
              <FiBell />
              <span className="notification-badge">3</span>
            </button>
          </div>

          <div className="admin-profile">
            <img src={adminData.avatar} alt={adminData.name} className="admin-avatar" />
            <div className="profile-info">
              <span className="admin-name">{adminData.name}</span>
              <span className="admin-role">{adminData.role}</span>
            </div>
          </div>
        </div>
      </nav>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          {sidebarOpen && <h2 className="sidebar-brand">Coach Panel</h2>}
        </div>

        <div className="sidebar-menu">
          <div className="menu-items-container">
            {menuItems.map((item, index) => (
              <div key={index} className="menu-group">
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => {
                      setActiveMenu(item.title);
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.title}</span>
                  </Link>
                ) : (
                  <>
                    <div
                      className={`menu-item ${activeMenu === item.title ? 'active' : ''}`}
                      onClick={() => toggleMenu(item.title)}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.title}</span>
                      <span className="menu-arrow">
                        {activeMenu === item.title ? <FiChevronDown /> : <FiChevronRight />}
                      </span>
                    </div>

                    {activeMenu === item.title && (
                      <div className="submenu">
                        {item.submenus.map((sub, subIndex) => (
                          <Link
                            key={subIndex}
                            to={sub.path}
                            className={`submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isMobile) setSidebarOpen(false);
                            }}
                          >
                            <span className="submenu-icon">{sub.icon}</span>
                            <span className="submenu-text">{sub.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="menu-group logout-group">
            <button className="menu-item logout" onClick={handleLogout}>
              <span className="menu-icon"><FiLogOut /></span>
              <span className="menu-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

<main className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
  <div className="content-wrapper">
    <Outlet />  {/* This will render the nested routes */}
  </div>
</main>
    </div>
  );
};


export default CoatchDashboard;