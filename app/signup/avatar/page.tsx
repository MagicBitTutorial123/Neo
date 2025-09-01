"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NextButton from "@/components/NextButton";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import AccountSuccessPopup from "@/components/AccountSuccessPopup";

const avatars = [
  "/Avatar01.png",
  "/Avatar02.png",
  "/Avatar03.png",
  "/Avatar04.png",
  "/Avatar05.png",
];

export default function SignupAvatar() {
  const router = useRouter();
  const { registrationData, updateRegistrationData, clearRegistrationData } = useUser();
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [userNameForPopup, setUserNameForPopup] = useState<string>("");

  //DISPLAY NAME
  const [displayName, setDisplayName] = useState(registrationData.name || "");
  useEffect(() => {
    if (!displayName) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("name") : null;
      if (saved) setDisplayName(saved);
    }
  }, []); // Remove displayName from dependency array to prevent infinite loop

  // Add navigation guard to ensure user has completed previous steps
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
    const phone = localStorage.getItem("fullPhone");
    const name = localStorage.getItem("name");
    const age = localStorage.getItem("age");
    const password = localStorage.getItem("password") || localStorage.getItem("userPassword");
    
    if (!email || !email.trim()) {
      alert("Please complete the email step first");
      router.push("/signup/email");
      return;
    }
    
    if (!phone || !phone.trim()) {
      alert("Please complete the phone verification step first");
      router.push("/signup/phone");
      return;
    }
    
    if (!name || !name.trim()) {
      alert("Please complete the name step first");
      router.push("/signup/name");
      return;
    }
    
    if (!age || !age.trim()) {
      alert("Please complete the age step first");
      router.push("/signup/age");
      return;
    }
    
    if (!password || !password.trim()) {
      alert("Please complete the password step first");
      router.push("/signup/setpassword");
      return;
    }
  }, [router]);

  const handleBack = () => {
    // Clear phone verification flag when going back
    localStorage.removeItem("phoneVerified");
    localStorage.removeItem("otpSkipped");
    router.push("/signup/setpassword");
  };

  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selected === null) return;

    setLoading(true);
    setError(null);

    try {
      // Collect all signup data from localStorage
      const email = localStorage.getItem("userEmail") || localStorage.getItem("signupEmail");
      let phone = localStorage.getItem("fullPhone");
      const name = localStorage.getItem("name");
      const age = localStorage.getItem("age");
      const password = localStorage.getItem("password") || localStorage.getItem("userPassword");
      const avatar = avatars[selected];
      
      // Comprehensive validation of all required fields
      if (!email || !email.trim()) {
        throw new Error("Email address is required. Please go back to the email step.");
      }

      if (!phone || !phone.trim()) {
        throw new Error("Phone number is required. Please go back to the phone step.");
      }

      // Ensure phone number has proper format (add + if missing)
      if (phone && !phone.startsWith('+')) {
        phone = '+' + phone;
        console.log('📱 Phone number format corrected:', phone);
      }

      if (!name || !name.trim()) {
        throw new Error("Full name is required. Please go back to the name step.");
      }

      if (!age || !age.trim()) {
        throw new Error("Age is required. Please go back to the age step.");
      }

      // Validate age is a valid number between 13-120
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        throw new Error("Age must be between 13 and 120 years. Please go back to the age step.");
      }

      if (!password || !password.trim()) {
        throw new Error("Password is required. Please go back to the password step.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long. Please go back to the password step.");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address. Please go back to the email step.");
      }

      // Validate phone format (should be 10-15 digits including country code)
      const cleanPhone = phone.replace(/[+\s-]/g, "");
      const phoneValidationData = { 
        originalPhone: phone, 
        cleanPhone, 
        cleanPhoneLength: cleanPhone.length,
        isValid: /^\d{10,15}$/.test(cleanPhone)
      };
      console.log('📱 Phone validation check:', phoneValidationData);
      
      if (!/^\d{10,15}$/.test(cleanPhone)) {
        console.error('❌ Phone validation failed:', phoneValidationData);
        throw new Error("Please enter a valid phone number (10-15 digits including country code). Please go back to the phone step.");
      }
      
      console.log('📱 Phone validation passed:', phoneValidationData);

      // Validate name format (only letters and spaces, at least 2 characters)
      const nameRegex = /^[a-zA-Z ]{2,32}$/;
      if (!nameRegex.test(name)) {
        throw new Error("Name should only contain letters and spaces, 2-32 characters. Please go back to the name step.");
      }

      const collectedData = { 
        email, 
        phone, 
        name, 
        age, 
        avatar,
        localStorage: {
          userEmail: localStorage.getItem("userEmail"),
          signupEmail: localStorage.getItem("signupEmail"),
          fullPhone: localStorage.getItem("fullPhone"),
          name: localStorage.getItem("name"),
          age: localStorage.getItem("age"),
          password: localStorage.getItem("password"),
          userPassword: localStorage.getItem("userPassword")
        }
      };
      console.log('📋 Collected signup data:', collectedData);
      
      // Final data format check before Supabase
      const finalData = {
        email: email,
        full_name: name,
        phone: phone,
        age: age,
        avatar: avatar
      };
      console.log('📋 Final data for Supabase:', finalData);

      // Step 1: Create user in Supabase Auth (basic only - no custom metadata)
      const signUpData = {
        email,
        password: password ? '***' : 'MISSING',
        options: {
          data: {
            full_name: name,
            phone: phone,
            avatar: avatar
            // Note: age is not stored in auth metadata, only in profile table
          }
        }
      };
      console.log('🚀 About to call supabase.auth.signUp with data:', signUpData);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            avatar: avatar
            // Note: age is not stored in auth metadata, only in profile table
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      console.log('✅ User created successfully:', authData.user.id);
      console.log('✅ Profile will be created automatically by database trigger');
      console.log('🔍 User metadata from Supabase:', authData.user.user_metadata);
      console.log('🔍 User data from Supabase:', authData.user);
      console.log('🔍 User session status:', authData.session ? 'Active' : 'No session');
      console.log('🔍 User email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
      
      // Step 2: Check if profile already exists (from database trigger) and update it
      console.log('🔄 Checking if profile already exists...');
      
      // Wait a moment for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing profile:', fetchError);
      }
      
      if (existingProfile) {
        console.log('✅ Profile already exists from database trigger, updating it...');
        console.log('📋 Existing profile data:', existingProfile);
        
        // Update existing profile with complete data
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email: email,
            full_name: name,
            phone: phone,
            age: parseInt(age),
            avatar: avatar,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', authData.user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Profile update failed:', updateError);
          throw new Error(`Profile update failed: ${updateError.message}`);
        } else {
          console.log('✅ Profile updated successfully with complete data:', updatedProfile);
        }
      } else {
        console.log('🔄 No existing profile found, creating new one...');
        
        // Create new profile
        const profileDataToInsert = {
          user_id: authData.user.id,
          email: email,
          full_name: name,
          phone: phone,
          age: parseInt(age),
          avatar: avatar,
          bio: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('🔄 Creating new user profile with data:', JSON.stringify(profileDataToInsert, null, 2));
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileDataToInsert])
          .select()
          .single();
        
        if (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          console.error('❌ Error details:', JSON.stringify({
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          }, null, 2));
          
          // Try alternative approach - update the user metadata instead
          console.log('🔄 Trying alternative approach: updating user metadata...');
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: name,
              phone: phone,
              age: parseInt(age),
              avatar: avatar
            }
          });
          
          if (updateError) {
            console.error('❌ User metadata update also failed:', updateError);
            throw new Error(`Profile creation failed: ${profileError.message}`);
          } else {
            console.log('✅ User metadata updated successfully as fallback');
          }
        } else {
          console.log('✅ New profile created successfully:', profileData);
        }
      }

      // Profile creation/update completed successfully
      console.log('✅ Profile data processing completed successfully');
      
      // Save avatar selection to context
      updateRegistrationData({ avatar: avatar });
      
      // Store user's name for the success popup before clearing localStorage
      setUserNameForPopup(name);
      
      // Clear registration data from context and localStorage
      clearRegistrationData();
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("fullPhone");
      localStorage.removeItem("name");
      localStorage.removeItem("age");
      localStorage.removeItem("password");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("currentOTP");
      localStorage.removeItem("phoneVerified");
      localStorage.removeItem("otpSkipped");
      localStorage.removeItem("signupStarted");
      
      // Show success popup instead of redirecting to email confirmation
      setShowSuccessPopup(true);

    } catch (error) {
      console.error('❌ Registration failed:', error);
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F8F9FC] flex items-center justify-center overflow-hidden">
      {/* Chevron left button on far left, vertically centered */}
      <button
        onClick={handleBack}
        className="w-[96px] h-[96px] flex items-center justify-center rounded-full group focus:outline-none absolute left-0 top-1/2 -translate-y-1/2 z-20"
        style={{ minWidth: 96, minHeight: 96 }}
        aria-label="Back to password step"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:stroke-[#222E3A] stroke-[#222E3A]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="30 12 18 24 30 36" />
        </svg>
      </button>
      {/* Logo in top left */}
      <div className="absolute ml-12 mt-8 top-8 left-8 z-30">
        <Image
          src="/BuddyNeo-expanded.svg"
          alt="BuddyNeo Logo"
          width={320}
          height={60}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      <div className="w-full h-full max-w-full max-h-full bg-[#F8F9FC] flex items-center justify-center relative p-8">
        {/* Centered overlay content */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-[700px] px-4 z-10">
          <div className="flex flex-col items-center mb-2">
            <div className="rounded-full border-4 border-[#E0E0E0] bg-[#EDEAF6] w-40 h-40 flex items-center justify-center mb-2 overflow-hidden shadow-xl">
              {selected !== null ? (
                <Image
                  src={avatars[selected]}
                  alt="Selected Avatar"
                  width={180}
                  height={180}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="50"
                    cy="36"
                    r="20"
                    stroke="#AAA"
                    strokeWidth="4"
                  />
                  <path
                    d="M20 80c0-13.255 13.431-24 30-24s30 10.745 30 24"
                    stroke="#AAA"
                    strokeWidth="4"
                  />
                </svg>
              )}
            </div>
            <div className="text-2xl font-bold text-[#888] mb-2">{displayName||"Name"}</div>
          </div>
          <div className="mb-4 mt-2 text-2xl md:text-3xl font-extrabold text-[#222E3A] text-center font-poppins">
            Select your avatar
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm text-center max-w-[400px]">
              {error}
            </div>
          )}

          <div className="flex flex-row items-center justify-center gap-6 mb-8">
            {avatars.map((src, idx) => (
              <button
                key={src}
                type="button"
                className={`rounded-full p-2 transition-all border-4 ${
                  selected === idx
                    ? "border-[#00AEEF] bg-[#FFFBEA]"
                    : "border-transparent bg-[#FFFBEA]"
                } focus:outline-none`}
                style={{
                  width: 110,
                  height: 110,
                  transform: hovered === idx ? "scale(1.50)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
                onClick={() => setSelected(idx)}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Select avatar ${idx + 1}`}
              >
                <Image
                  src={src}
                  alt={`Avatar ${idx + 1}`}
                  width={90}
                  height={90}
                  style={{ borderRadius: "50%" }}
                />
              </button>
            ))}
          </div>
          <NextButton 
            disabled={selected === null || loading} 
            onClick={handleNext}
          >
            {loading ? "Creating Account..." : "Complete Signup"}
          </NextButton>
        </div>
      </div>

      {/* Success Popup */}
      <AccountSuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        userName={userNameForPopup || "User"}
      />
    </div>
  );
}
