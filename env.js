const ENV = {
  SUPABASE_URL: window.__env?.VITE_SUPABASE_URL || '',
  SUPABASE_KEY: window.__env?.VITE_SUPABASE_KEY || '',
  TMDB_API_KEY: window.__env?.VITE_TMDB_API_KEY || '',
  
  validate() {
    const missing = [];
    if (!this.SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
    if (!this.SUPABASE_KEY) missing.push('VITE_SUPABASE_KEY');
    if (!this.TMDB_API_KEY) missing.push('VITE_TMDB_API_KEY');
    
    if (missing.length > 0) {
      console.error(
        '[ENV] Missing required environment variables:\n' +
        missing.map(v => `  - ${v}`).join('\n') +
        '\n\nPlease check the .env file and restart the development server.'
      );
      return false;
    }
    return true;
  }
};

window.addEventListener('DOMContentLoaded', () => {
  if (!ENV.validate()) {
    console.warn('[ENV] Environment validation failed. Some features may not work.');
  }
});
