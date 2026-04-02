let ENV = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  TMDB_API_KEY: ''
};

let envReady = false;

async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      ENV = {
        SUPABASE_URL: config.SUPABASE_URL || '',
        SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY || '',
        TMDB_API_KEY: config.TMDB_API_KEY || ''
      };
    }
  } catch (error) {
  }
  envReady = true;
}

loadConfig();

async function waitForConfig(timeout = 5000) {
  const start = Date.now();
  while (!envReady && Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 50));
  }
}
