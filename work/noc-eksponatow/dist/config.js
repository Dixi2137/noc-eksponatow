/* Cloud configuration. The publishable (anon) key is public by design: Row Level Security on the server decides what it may touch.
   Leave both empty to run fully offline (guest mode only). */
window.MuseumConfig = Object.freeze({
  supabaseUrl: 'https://dtkmxjltovqjcrwnhobf.supabase.co',
  supabaseAnonKey: 'sb_publishable_dG-qoLrdC5L6Lf_j3rSyqA_Ix51JZDM'
});
