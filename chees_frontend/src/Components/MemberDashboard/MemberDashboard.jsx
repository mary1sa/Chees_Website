import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const MemberDashboard = () => {
  return (
    <div>
      <h1>Member dashboard</h1>
      <nav>
        <Link to="profile">profile</Link>
      </nav>
      <Outlet />
    </div>
  )
}

export default MemberDashboard
