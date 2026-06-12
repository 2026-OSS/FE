/**
 * Navigation Layout Component
 * 
 * 앱 네비게이션 컴포넌트
 */

import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation">
      <ul className="nav-list">
        <li>
          <Link to="/">홈</Link>
        </li>
        <li>
          <Link to="/reading">독서</Link>
        </li>
        <li>
          <Link to="/guide">가이드</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
