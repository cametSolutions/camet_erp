/* eslint-disable react/prop-types */
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { HiMiniUserCircle } from "react-icons/hi2";

const Footer = ({ user }) => {

  return (
    <footer className="w-full py-2 px-6 mt-8 bg-gray-100 border-t border-gray-200">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Company name */}
        <span className="text-xs font-bold text-gray-500">
          @ Camet IT Solutions LLP
        </span>
        
        {/* All icons grouped together */}
        <div className="flex items-center gap-3">
          {/* Social media icons */}
          <a
            href="#"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            <FaInstagram size={21} />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-700 transition-colors duration-200"
          >
            <FaFacebook size={20} />
          </a>
          
          {/* Separator line */}
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          
          {/* User toggle icon */}
          {user === "admin" ? (
            <Link 
              to={"/sUsers/login"} 
              className="text-gray-500 hover:text-blue-700 transition-colors duration-200 p-1 rounded"
              title="Switch to User Login"
            >
              <HiMiniUserCircle size={22} />
            </Link>
          ) : (
            <Link 
              to={"/admin/login"} 
              className="text-gray-500 hover:text-violet-600 transition-colors duration-200 p-1 rounded"
              title="Switch to Admin Login"
            >
              <MdAdminPanelSettings size={22} />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
