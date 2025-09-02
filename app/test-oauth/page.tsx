"use client";

export default function TestOAuth() {
  const testCallback = () => {
    console.log("🧪 Testing OAuth callback route...");
    window.location.href = "/auth/callback?code=test123";
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
      <button 
        onClick={testCallback}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test OAuth Callback (test123)
      </button>
    </div>
  );
}
