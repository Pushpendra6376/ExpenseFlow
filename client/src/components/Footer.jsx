import React from 'react';
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Section 1: Brand & Description */}
          <div>
            <h2 className="text-2xl font-bold text-blue-500 mb-4">ExpenseFlow</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Track your daily expenses easily and manage your budget efficiently. 
              Join us to achieve your financial goals.
            </p>
          </div>

          {/* Section 2: Quick Links & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/add-transaction" className="hover:text-blue-400 transition">Add Transaction</Link></li>
              <li><Link to="/PrivacyPolicy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              <li><Link to="/TermOfUse" className="hover:text-blue-400 transition">Terms of Use</Link></li>
            </ul>
          </div>

          {/* Section 3: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Contact Us</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                <a href="mailto:pp5395021@gmail" className="hover:text-white transition">pp5395021@gmail</a>
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="text-blue-500" />
                <a href="tel:+916376547126" className="hover:text-white transition">+91 6376547126</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        {/* Bottom Bar: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ExpenseFlow. All rights reserved.</p>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="https://github.com/pushpendra6376" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-white transition hover:scale-110">
              <FaGithub />
            </a>
            <a href="https://linkedin.com/in/pushpendra-patel-0a4a36261" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-blue-400 transition hover:scale-110">
              <FaLinkedin />
            </a>
            <a href="https://instagram.com/yrr_pushpendra" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-pink-500 transition hover:scale-110">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;