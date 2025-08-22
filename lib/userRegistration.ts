import { supabase } from './supabaseClient';

export interface UserRegistrationData {
  email: string;
  phone: string;
  name: string;
  age: number;
  password: string;
  avatar: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Save user registration data to Supabase
 * This function handles both new users and existing users
 */
export async function saveUserToSupabase(userData: UserRegistrationData) {
  try {
    console.log('💾 Saving user data to Supabase:', userData);

    // First, check if user already exists in auth.users
    const { data: existingUser, error: userCheckError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    let userId: string;

    if (existingUser?.user) {
      // User already exists, use their ID
      userId = existingUser.user.id;
      console.log('✅ Using existing user ID:', userId);
    } else {
      // User doesn't exist, create new one
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            age: userData.age,
            phone: userData.phone,
            avatar: userData.avatar,
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

      userId = authData.user.id;
      console.log('✅ New user created in Supabase Auth:', userId);
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      console.log('⚠️ Profile already exists, updating...');
      
      // Update existing profile
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email: userData.email,
          phone: userData.phone,
          full_name: userData.name,
          age: userData.age,
          avatar: userData.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      console.log('✅ Profile updated successfully:', updateData);
      return {
        success: true,
        user: { id: userId },
        profile: updateData,
        message: 'User profile updated successfully'
      };
    } else {
      // Create new profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            email: userData.email,
            phone: userData.phone,
            full_name: userData.name,
            age: userData.age,
            avatar: userData.avatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select();

      if (profileError) {
        console.error('❌ Profile save error:', profileError);
        throw new Error(`Profile save failed: ${profileError.message}`);
      }

      console.log('✅ User profile saved to database:', profileData);
      return {
        success: true,
        user: { id: userId },
        profile: profileData[0],
        message: 'User profile created successfully'
      };
    }

  } catch (error) {
    console.error('❌ User registration failed:', error);
    throw error;
  }
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    throw error;
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(userId: string, updates: Partial<UserRegistrationData>) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Get all user profiles (for admin purposes)
 */
export async function getAllUserProfiles() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all user profiles:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to get all user profiles:', error);
    throw error;
  }
}
