import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-4xl mx-auto p-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-4">
            <p>Welcome to ExpenseFlow. Your privacy is important to us.</p>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p>We collect your name, email, and transaction data to provide expense tracking services.</p>
            
            <h2 className="text-xl font-semibold">2. How We Use Data</h2>
            <p>Your data is used solely for generating reports and analytics for your personal use. We do not sell your data.</p>
            
            <h2 className="text-xl font-semibold">3. Contact Us</h2>
            <p>If you have questions, email us at <strong>pp5395021@gmail</strong>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;