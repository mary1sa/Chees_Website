
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUserPlus,
  FiDollarSign, FiCalendar, FiSettings, FiKey,
  FiLogOut, FiBell, FiSearch, FiSun, FiMoon,
  FiChevronDown, FiChevronRight, FiChevronLeft,
  FiCreditCard, FiFileText, FiList, FiBook,
  FiBookmark, FiPlay, FiAward, FiHeart,
  FiUser
} from 'react-icons/fi';
import '../AdminDashboard/AdminDashboard.css';

const MemberDashboard = () => {
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
      path: "/member"
    },
    {
      title: "My Courses",
      icon: <FiBook />,
      submenus: [
        { 
          title: "Enrolled Courses", 
          path: "/member/courses/enrolled",
          icon: <FiBookmark className="submenu-icon" />
        },
        { 
          title: "Course Catalog", 
          path: "/member/courses/catalog",
          icon: <FiList className="submenu-icon" />
        },
        { 
          title: "My Progress", 
          path: "/member/courses/progress",
          icon: <FiAward className="submenu-icon" />
        },
        { 
          title: "Wishlist", 
          path: "/member/courses/wishlist",
          icon: <FiHeart className="submenu-icon" />
        }
      ]
    },
    {
      title: "Events",
      icon: <FiCalendar />,
      path: "/member/events"
    },
    {
      title: "My Registrations",
      icon: <FiCalendar />,
      path: "/member/dashboard/registrations"
    },
    {
      title: "Payments",
      icon: <FiDollarSign />,
      path: "/member/payments"
    },
    {
          title: "Book Store",
          icon: <FiBook />, 
          submenus: [
            { 
              title: "Books", 
              path: "books",
              icon: <FiBook className="submenu-icon" />
            },
            { 
              title: "Authors", 
              path: "authors",
              icon: <FiUser className="submenu-icon" />
            }
          ]
      },
    {
      title: "Settings",
      icon: <FiSettings />,
      path: "/member/settings"
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
         
        </div>
      </nav>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          {sidebarOpen && <h2 className="sidebar-brand">Admin Panel</h2>}
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default MemberDashboard;