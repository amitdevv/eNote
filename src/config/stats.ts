import { getActiveUserCount } from '@/lib/supabase';

// User Statistics Configuration
// These numbers are now fetched from the real database!

export interface UserStats {
  totalUsers: number;
  githubStars: number;
  lastUpdated: string;
}

export const userStats: UserStats = {
  // Fallback numbers - real numbers are fetched from database
  totalUsers: 42,        // Fallback count
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

// Fetch REAL user count from Supabase database
export const fetchRealUserCount = async (): Promise<number> => {
  try {
    const count = await getActiveUserCount();
    console.log('Real user count from database:', count);
    return count;
  } catch (error) {
    console.error('Failed to fetch real user count:', error);
    return userStats.totalUsers; // Fallback to static count
  }
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