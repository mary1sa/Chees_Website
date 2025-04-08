import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUserPlus,
  FiDollarSign, FiCalendar, FiSettings, FiKey,
  FiLogOut, FiBell, FiSearch, FiSun, FiMoon,
  FiChevronDown, FiChevronRight, FiChevronLeft,
  FiCreditCard, FiFileText, FiList
} from 'react-icons/fi';
import './AdminDashboard.css';

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
      path: "/admin"
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
          title: "Roles", 
          path: "/admin/users/roles",
          icon: <FiKey className="submenu-icon" />
        }
      ]
    },
    {
      title: "Financial",
      icon: <FiDollarSign />,
      submenus: [
        { 
          title: "Payments", 
          path: "/admin/payments",
          icon: <FiCreditCard className="submenu-icon" />
        },
        { 
          title: "Invoices", 
          path: "/admin/invoices",
          icon: <FiFileText className="submenu-icon" />
        }
      ]
    },
    {
      title: "Settings",
      icon: <FiSettings />,
      path: "/admin/settings"
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
            <img   src={
                     adminData.profile_picture
                        ? `http://localhost:8000/storage/${ adminData.profile_picture}`
                        :  '/anony.jpg'
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

export default AdminDashboard;