import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiHome, FiUsers, FiUserPlus,
  FiDollarSign, FiCalendar, FiSettings,
  FiLogOut, FiBell, FiSearch, FiSun, FiMoon,
  FiChevronDown, FiChevronRight, FiChevronLeft,
  FiCreditCard,
  FiFileText
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const navigate = useNavigate();

  const adminData = {
    name: "Admin Name",
    avatar: "/admin-avatar.jpg",
    role: "Super Admin"
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? '' : menu);
  };

  const handleLogout = () => {
    navigate('/login');
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
        { title: "All Users", path: "/admin/users" },
        { title: "Add User", path: "/admin/users/add",  icon: <FiUserPlus className="submenu-icon" />
        },
        { title: "Roles", path: "/admin/users/roles" }
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
      <nav className="admin-navbar">
        <div className="navbar-left">
          <button className="menu-toggle mobile-only" onClick={toggleSidebar}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1 className="brand-name">Admin Panel</h1>
        </div>

        {/* <div className="navbar-center">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
        </div> */}

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
          <button className="sidebar-toggle desktop-only" onClick={toggleSidebar}>
            {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <div key={index} className="menu-group">
              {item.path ? (
                <Link
                  to={item.path}
                  className={`menu-item ${activeMenu === item.title ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.title)}
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
              className="submenu-item"
              onClick={(e) => e.stopPropagation()}
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
          
          <div className="menu-group logout-group">
            <button className="menu-item logout" onClick={handleLogout}>
              <span className="menu-icon"><FiLogOut /></span>
              <span className="menu-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;