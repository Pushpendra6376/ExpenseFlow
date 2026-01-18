import React from 'react';


const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto p-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-4">
          <p>Welcome to ExpenseFlow. Your privacy is important to us.</p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>We collect your name, email, and transaction data.</p>

          <h2 className="text-xl font-semibold">2. How We Use Data</h2>
          <p>Your data is used only for your personal analytics.</p>

          <h2 className="text-xl font-semibold">3. Contact Us</h2>
          <p>Email us at <strong>pp5395021@gmail.com</strong>.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
