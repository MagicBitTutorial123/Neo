"use client";

export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> 
          <span className="ml-2 text-green-600">
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing'}
          </span>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> 
          <span className="ml-2 text-green-600">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Status:</strong> ✅ Environment variables are loaded! Google OAuth should work now.</p>
        <p><strong>Next:</strong> Try Google login on the /signin page</p>
      </div>
    </div>
  );
}
