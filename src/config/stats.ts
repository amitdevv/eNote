import { getTotalRegisteredUsers } from '@/lib/supabase';

// User Statistics Configuration
// These numbers are now fetched from the real database with periodic updates!

export interface UserStats {
  totalUsers: number;
  githubStars: number;
  lastUpdated: string;
}

export const userStats: UserStats = {
  // Fallback numbers - real numbers are fetched from database
  totalUsers: 3,        // Updated fallback to match your actual count
  githubStars: 0,        // GitHub repository stars
  lastUpdated: '2024-12-01' // When these stats were last updated
};

// Helper function to get formatted stats
export const getDisplayStats = () => {
  return {
    totalUsers: userStats.totalUsers.toLocaleString(),
    githubStars: userStats.githubStars.toLocaleString()
  };
};

// Fetch REAL registered user count from Supabase database (FIXED)
export const fetchRealUserCount = async (): Promise<number> => {
  try {
    const count = await getTotalRegisteredUsers();
    console.log('📊 Real TOTAL registered users from database:', count);
    return count;
  } catch (error) {
    console.error('Failed to fetch real user count:', error);
    return userStats.totalUsers; // Fallback to static count
  }
};

// Set up periodic user count updates (simplified - no real-time subscriptions)
export const setupLiveUserCount = (callback: (count: number) => void) => {
  console.log('Setting up periodic user count updates...');
  
  // Initial fetch
  fetchRealUserCount().then(callback).catch(console.error);
  
  // Set up periodic updates every 5 minutes
  const interval = setInterval(async () => {
    try {
      const count = await fetchRealUserCount();
      callback(count);
    } catch (error) {
      console.error('Error in periodic user count update:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

// Fetch user count with periodic updates
export const fetchUserCountWithUpdates = (
  onUpdate: (count: number) => void,
  intervalMinutes: number = 5
) => {
  // Initial fetch
  fetchRealUserCount().then(onUpdate);
  
  // Set up periodic updates
  const interval = setInterval(async () => {
    try {
      const count = await fetchRealUserCount();
      onUpdate(count);
    } catch (error) {
      console.error('Error in periodic user count update:', error);
    }
  }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

// TODO: Fetch GitHub stars from GitHub API
export const fetchGitHubStars = async (repo: string): Promise<number> => {
  try {
    // Example: 'username/repository-name'
    const response = await fetch(`https://api.github.com/repos/${repo}`);
    if (!response.ok) throw new Error('GitHub API request failed');
    
    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error);
    return userStats.githubStars; // Fallback to static count
  }
};

// TODO: In the future, consider fetching these from your analytics API
// export const fetchLiveStats = async (): Promise<UserStats> => {
//   const response = await fetch('/api/stats');
//   return response.json();
// }; 