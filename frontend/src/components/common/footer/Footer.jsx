/* eslint-disable react/prop-types */
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiMiniUserCircle } from "react-icons/hi2";

const Footer = ({ user }) => {
  return (
    <footer className="flex justify-center items-center  w-full py-3 px-6 mt-8 bg-gray-100 border-t border-gray-200">
      <div className="flex flex-col gap-2 items-center justify-center max-w-6xl mx-auto">
        {/* Company name */}
        <span className="text-xs font-semibold text-gray-500">
          © 2025 Camet IT Solutions LLP
        </span>

        {/* All icons grouped together */}
        <div className="flex items-center gap-3">
          {/* Social media icons */}
          <span
           
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            <FaInstagram size={17} />
          </span>
          <span
          
            className="text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            <FaLinkedin size={16} />
          </span>
          <span
            className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
          >
            <FaTwitter size={16} />
          </span>
          <span
            className="text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            <FaFacebook size={16} />
          </span>

          {/* Separator line */}
          <div className="w-px h-5 bg-gray-300 "></div>

          {/* User toggle icon */}
          {user === "admin" ? (
            <Link
              to={"/sUsers/login"}
              className="text-gray-500 hover:text-violet-700 transition-colors duration-200 "
              title="Switch to User Login"
            >
              <HiMiniUserCircle size={20} />
            </Link>
          ) : (
            <Link
              to={"/admin/login"}
              className="text-gray-500 hover:text-violet-700 transition-colors duration-200 "
              title="Switch to Admin Login"
            >
              <MdAdminPanelSettings size={20} />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
