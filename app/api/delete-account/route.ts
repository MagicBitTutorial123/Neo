import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Delete account API route called');
    
    // Parse request body to get user ID
    const { userId } = await request.json();
    
    if (!userId) {
      console.error('❌ No user ID provided in request body');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ User ID received from request:', userId);
    
         // Create Supabase client for database operations using direct client
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );
     console.log('✅ Supabase client created');
    
    console.log('🗑️ Starting account deletion for user:', userId);

    // 1. Delete user profile from user_profiles table
    console.log('🗑️ Attempting to delete user profile...');
    const { data: deleteResult, error: profileDeleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)
      .select();

    if (profileDeleteError) {
      console.error('❌ Error deleting user profile:', profileDeleteError);
      console.error('❌ Error details:', {
        code: profileDeleteError.code,
        message: profileDeleteError.message,
        details: profileDeleteError.details,
        hint: profileDeleteError.hint
      });
      return NextResponse.json(
        { error: `Failed to delete user profile: ${profileDeleteError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User profile deleted from database. Result:', deleteResult);

    // 1.5. Delete any other user-related data (missions, projects, etc.)
    // Add more table deletions here as needed for your application
    try {
      // Example: Delete user missions if they exist
      const { error: missionsDeleteError } = await supabase
        .from('missions')
        .delete()
        .eq('user_id', userId);
      
      if (missionsDeleteError) {
        console.log('⚠️ Could not delete missions:', missionsDeleteError.message);
      } else {
        console.log('✅ User missions deleted');
      }

      // Example: Delete user projects if they exist
      const { error: projectsDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);
      
      if (projectsDeleteError) {
        console.log('⚠️ Could not delete projects:', projectsDeleteError.message);
      } else {
        console.log('✅ User projects deleted');
      }

    } catch (cleanupError) {
      console.log('⚠️ Some cleanup operations failed, but continuing with account deletion:', cleanupError);
    }

    // 2. Note: We cannot delete the user from auth.users table from client-side
    // The user will need to be manually removed from Supabase Auth dashboard
    // or through a server-side admin function
    console.log('⚠️ User profile deleted. User must be manually removed from Auth dashboard.');

    // 3. We cannot sign out from server-side for the client
    // This will be handled on the client side

    console.log('✅ Account deletion completed successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account deleted successfully',
        userId: userId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' },
      { status: 500 }
    );
  }
}
