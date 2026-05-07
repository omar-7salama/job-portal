import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeToken, getUserFromToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Job Portal
        </Link>
        <div className="flex space-x-4">
          <Link to="/jobs" className="hover:text-blue-300">
            Jobs
          </Link>
          {isAuthenticated() && user?.role === 'JOB_SEEKER' && (
            <Link to="/applications" className="hover:text-blue-300">
              My Applications
            </Link>
          )}
          {isAuthenticated() && user?.role === 'EMPLOYER' && (
            <Link to="/post-job" className="hover:text-blue-300">
              Post a Job
            </Link>
          )}
          {isAuthenticated() ? (
            <button onClick={handleLogout} className="hover:text-blue-300">
              Logout
            </button>
          ) : (
            <Link to="/login" className="hover:text-blue-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;