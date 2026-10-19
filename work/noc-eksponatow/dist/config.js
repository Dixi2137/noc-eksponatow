/* Cloud configuration. The anon key is public by design: Row Level Security on the server decides what it may touch.
   Leave both empty to run fully offline (guest mode only). */
window.MuseumConfig = Object.freeze({
  supabaseUrl: '',
  supabaseAnonKey: ''
});
