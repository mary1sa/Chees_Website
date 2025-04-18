

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUserPlus,
  FiDollarSign, FiCalendar, FiSettings, FiKey,
  FiLogOut, FiBell, FiSun, FiMoon,
  FiChevronDown, FiChevronRight,
  FiCreditCard, FiFileText, FiList, 
  FiLayers, FiAward, FiBook, FiPlusCircle,
  FiBarChart2, FiUserCheck, FiUser, FiPlus, FiShoppingCart,FiGrid

} from 'react-icons/fi';
import './AdminDashboard.css';
import { Star } from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [adminData, setAdminData] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const storedAdminData = JSON.parse(localStorage.getItem('user'));

    if (storedAdminData && storedAdminData.role === 'admin') {
      setAdminData(storedAdminData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Auto-expand active menu based on current route
    if (location.pathname.includes('/admin/dashboard/events')) {
      setActiveMenu('Events');
    } else if (location.pathname.includes('/admin/dashboard/fetchusers')) {
      setActiveMenu('User Management');
    } else if (location.pathname.includes('/admin/dashboard/sessions')) {
      setActiveMenu('Session Management');
    } else if (location.pathname.includes('/admin/dashboard/courses')) {
      setActiveMenu('Course Management');
    } else if (location.pathname.includes('/admin/dashboard/levels')) {
      setActiveMenu('Course Level Management');
    } else if (location.pathname.includes('/admin/dashboard/enrollments')) {
      setActiveMenu('Enrollments');
    } else if (location.pathname.includes('/admin/dashboard/books')) {
      setActiveMenu('Book Store');
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) setSidebarOpen(false);
      if (!mobile && !sidebarOpen) setSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, location.pathname]);

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
      path: "/admin/dashboard"
    },

   
    {
      title: "User Management",
      icon: <FiUsers />,
      submenus: [
        { 
          title: "All Users", 
          path: "fetchusers",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add User", 
          path: "createuser",
          icon: <FiUserPlus className="submenu-icon" />
        },
        { 
          title: "User Roles", 
          path: "roles",
          icon: <FiKey className="submenu-icon" />
        }
      ]
    },
    {
      title: "Events",
      icon: <FiCalendar />,
      submenus: [
        { 
          title: "All Events", 
          path: "events",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Event Types", 
          path: "events/types",
          icon: <FiLayers className="submenu-icon" />
        },
        { 
          title: "Registrations", 
          path: "events/registrations",
          icon: <FiAward className="submenu-icon" />
        }
      ]
    },


    {
      title: "Coatchs",
      icon: <FiAward />,
      submenus: [
        { 
          title: " All Coatches", 
          path: "Fetchcoatches",
          // icon: <FiFileText className="submenu-icon" />
          icon: <FiList className="submenu-icon" />

        },
        { 
          
          title: "CoatchCategorys", 
          path: "CoachSpecialization",
          icon: <FiGrid className="submenu-icon" />       },
          { 
          
            title: "Request Pending", 
            path: "RequestPending",
            icon: <FiFileText className="submenu-icon" />
 
               },
               { 
                 title: "Add coach", 
                 path: "CreateCoatch",
                 icon: <FiUserPlus className="submenu-icon" />
               },
      ]
    },
    {
      title: "Coach Availability",
      icon: <FiCalendar />,  
      submenus: [
        {
          title: "Coach Availability",
          icon: <FiList />,  
          path: "coachavailability"
        },
        { 
          title: "Add Availability", 
          path: "creatavailability",
          icon: <FiPlusCircle className="submenu-icon" /> 
        },
      ]
    }
,    
    {
      title: "Courses",
      icon: <FiBook />,
      submenus: [
        { 
          title: "All Courses", 
          path: "courses",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add Course", 
          path: "courses/create",
          icon: <FiPlusCircle className="submenu-icon" />
        }
      ]
    },
    {
      title: "Sessions",
      icon: <FiCalendar />,
      submenus: [
        { 
          title: "All Sessions", 
          path: "sessions",
          icon: <FiList className="submenu-icon" />
        },
      ]
    },
    {
      title: "Enrollments",
      icon: <FiCreditCard />,
      submenus: [
        { 
          title: "All Enrollments", 
          path: "enrollments",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Enrollment Packages", 
          path: "enrollments/packages",
          icon: <FiShoppingCart className="submenu-icon" />
        },
        { 
          title: "Create Enrollment", 
          path: "enrollments/create",
          icon: <FiPlusCircle className="submenu-icon" />
        },
        { 
          title: "Enrollment Sessions", 
          path: "enrollments/sessions",
          icon: <FiCalendar className="submenu-icon" />
        }
      ]
    },
    {
      title: "Course Levels",
      icon: <FiBarChart2 />,
      submenus: [
        { 
          title: "All Levels", 
          path: "levels",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "Add Level", 
          path: "createlevel",
          icon: <FiPlusCircle className="submenu-icon" />
        }
      ]
    },{
      title: "Book Store",
      icon: <FiBook />, 
      submenus: [
        { 
          title: "All Books", 
          path: "books",
          icon: <FiBook className="submenu-icon" />
        },
        { 
          title: "Add Book", 
          path: "books/create",
          icon: <FiPlus className="submenu-icon" />
        },
        { 
          title: "Authors", 
          path: "authors",
          icon: <FiUser className="submenu-icon" />
        },
        { 
          title: "Orders", 
          path: "orders",
          icon: <FiShoppingCart className="submenu-icon" />
        }
      ]
    },
    {
      title: "Financial",
      icon: <FiDollarSign />,
      submenus: [
        { 
          title: "Payments", 
          path: "payments",
          icon: <FiCreditCard className="submenu-icon" />
        },
        { 
          title: "Invoices", 
          path: "invoices",
          icon: <FiFileText className="submenu-icon" />
        }
      ]
    },
    {
      title: "reviewTable",
      icon: <Star />,
      path: "reviewTable"
    },
    {
      title: "Settings",
      icon: <FiSettings />,
      path: "settings"
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
          <h1 className="brand-name">RAJA CLUB INZGANE DES ECHECS</h1>
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
            <img src={
              adminData.profile_picture
                ? `http://localhost:8000/storage/${adminData.profile_picture}`
                : '/anony.jpg'
            } alt={adminData.name} className="admin-avatar" />

            <div className="profile-info">
              <span className="admin-name">{adminData.first_name} {adminData.last_name}</span>
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
          {sidebarOpen && <h2 className="sidebar-brand">RCI</h2>}
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-items-container">
            {menuItems.map((item, index) => (
              <div key={index} className="menu-group">
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`menu-item ${location.pathname === `/admin/dashboard/${item.path}` ? 'active' : ''}`}
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
                    <div className={`menu-item ${activeMenu === item.title ? 'active' : ''}`}
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
                            to={`/admin/dashboard/${sub.path}`}
                            className={`submenu-item ${location.pathname.includes(sub.path) ? 'active' : ''}`}
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;