import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-4xl mx-auto p-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>By accessing ExpenseFlow, you agree to be bound by these Terms of Use.</p>
            
            <h2 className="text-xl font-semibold">2. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
            
            <h2 className="text-xl font-semibold">3. Limitation of Liability</h2>
            <p>ExpenseFlow is not liable for any financial decisions made based on the data provided.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfUse;