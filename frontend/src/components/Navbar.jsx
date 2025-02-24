import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="bg-base-100 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto">
                <div className="navbar min-h-[4rem] px-4">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-lg w-52">
                                <li><Link to="/" className="text-neutral/80 hover:text-primary">Home</Link></li>
                                <li><Link to="/dashboard" className="text-neutral/80 hover:text-primary">Dashboard</Link></li>
                                <li><Link to="/create-contract" className="text-neutral/80 hover:text-primary">New Contract</Link></li>
                            </ul>
                        </div>
                        <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
                            Love Contracts
                        </Link>
                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 gap-2">
                            <li><Link to="/" className="text-neutral/80 hover:text-primary">Home</Link></li>
                            <li><Link to="/dashboard" className="text-neutral/80 hover:text-primary">Dashboard</Link></li>
                            <li><Link to="/create-contract" className="text-neutral/80 hover:text-primary">New Contract</Link></li>
                        </ul>
                    </div>
                    <div className="navbar-end gap-2">
                        <ThemeSwitcher />
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="btn btn-ghost text-neutral/80 hover:text-primary"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn btn-error text-white rounded-full"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="btn btn-ghost text-neutral/80 hover:text-primary hidden sm:inline-flex"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary rounded-full"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar; 