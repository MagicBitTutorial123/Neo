"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const avatars = [
  "/Avatar01.png",
  "/Avatar02.png",
  "/Avatar03.png",
  "/Avatar04.png",
  "/Avatar05.png",
];

export default function ProfileCompletionModal({ isOpen, onClose, user }: ProfileCompletionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("/Avatar02.png");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
    if (user?.user_metadata?.name) {
      setFullName(user.user_metadata.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          age: age,
          avatar: selectedAvatar,
          bio: bio.trim() || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        setError('Failed to save profile. Please try again.');
        return;
      }

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          age: age,
          avatar: selectedAvatar,
          bio: bio.trim() || ''
        }
      });

      if (authError) {
        console.error('❌ Auth update error:', authError);
        // Don't fail the whole process if auth update fails
      }

      console.log('✅ Profile completed successfully:', profile);
      
      // Close modal and redirect to home
      onClose();
      router.push('/home?profileCompleted=true');
      
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Welcome! Please complete your profile to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your phone number (optional)"
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              id="age"
              value={age || ""}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
              min="5"
              max="120"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your age (optional)"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself (optional)"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !fullName.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
