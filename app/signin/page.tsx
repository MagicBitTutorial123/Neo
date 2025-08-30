"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth sign in function
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    
    if (error) {
      console.error("❌ Google OAuth error:", error);
      setError(error.message);
      setLoading(false);
    }
    // Don't set loading to false here as user will be redirected
  };

  // Sign in function following Supabase tutorial
  async function signInWithEmail() {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting sign in with:", { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        console.error("❌ Error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        setError(error.message);
        return;
      }

      if (data.user) {  
        console.log("✅ Sign in successful:", data.user.email);
        
        // Redirect to home page
        router.push("/home");
      }
    } catch (err) {
      console.error("❌ Unexpected error during sign in:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmail();
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  // Function to check if user exists (for debugging)
  const checkUserExists = async () => {
    if (!email) {
      setError("Please enter an email first");
      return;
    }

    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.log("❌ Admin check failed:", error.message);
        return;
      }
      
      const userExists = data.users.some(user => user.email === email.trim().toLowerCase());
      console.log(`👤 User ${email} exists:`, userExists);
      
      if (userExists) {
        setError("User exists but sign in failed. Check your password.");
      } else {
        setError("User not found. Please sign up first.");
      }
    } catch (err) {
      console.log("❌ User check failed:", err);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Logo */}
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/side-logo.png"
          alt="BuddyNeo Logo"
          width={400}
          height={75}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[500px] px-4 z-10">
          {/* Sign In Form */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-[#222E3A] mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">
                Sign in to your BuddyNeo account
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              className="w-full rounded-full cursor-pointer py-3 mb-6 text-lg font-bold font-poppins bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 transition-colors flex items-center justify-center gap-3"
              aria-label="Sign in with Google"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0"
              >
                <g>
                  <path d="M36.545 20.233c0-1.36-.122-2.36-.388-3.393H20.204v6.16h9.32c-.188 1.52-1.2 3.8-3.45 5.34l-.032.21 5.012 3.89.348.034c3.19-2.94 5.033-7.27 5.033-12.24z" fill="#4285F4" />
                  <path d="M20.204 37c4.56 0 8.39-1.5 11.187-4.09l-5.33-4.14c-1.44 1.02-3.38 1.74-5.857 1.74-4.48 0-8.28-2.94-9.64-7.01l-.198.017-5.22 4.06-.068.19C7.66 33.36 13.48 37 20.204 37z" fill="#34A853" />
                  <path d="M10.564 23.5c-.36-1.02-.57-2.12-.57-3.24 0-1.12 .21-2.22 .55-3.24l-.01-.217-5.29-4.13-.173 .08A16.77 16.77 0 003.204 20.26c0 2.7 .66 5.25 1.82 7.49l5.74-4.25z" fill="#FBBC05" />
                  <path d="M20.204 11.96c3.17 0 5.31 1.36 6.53 2.5l4.77-4.65C28.58 6.97 24.76 5 20.204 5c-6.72 0-12.54 3.64-15.27 8.97l5.87 4.55c1.36-4.07 5.16-7.01 9.64-7.01z" fill="#EB4335" />
                </g>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent transition-colors pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F28B20] hover:bg-[#FF5900] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don&apos;t have an account?{" "}
                <button
                  onClick={handleSignUp}
                  className="text-[#00AEEF] hover:text-[#0088CC] font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
            {/* Forgot Password */}
             <div className="text-center mt-4">
               <button className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
                 Forgot your password?
               </button>
             </div>

             {/* Debug Button - Remove this in production */}
             <div className="text-center mt-2">
               <button 
                 type="button"
                 onClick={checkUserExists}
                 className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
               >
                 Debug: Check if user exists
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
