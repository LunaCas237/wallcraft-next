import { supabase } from '../lib/supabase';
import SearchInput from '../components/SearchInput'; 
import SearchResults from '../components/SearchResult'; // Import your new component

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const category = searchParams.category || '';

  let supabaseQuery = supabase.from('products').select('*');

  if (category) supabaseQuery = supabaseQuery.eq('collection_type', category);
  if (query) supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`);

  const { data: results, error } = await supabaseQuery;

  if (error) {
    console.error("Supabase Error:", error);
  }

  return (
    <main className="min-h-screen bg-black pt-32 px-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-8">
          <h1 className="text-[11px] uppercase tracking-[0.6em] text-[#B08038] mb-8">
            Explore Wallcraft
          </h1>
          
          <SearchInput />
          
          <p className="text-[#c2bfb6] text-[10px] uppercase tracking-[0.3em] mb-8">
            {query || category ? `SHOWING RESULTS` : "ENTER A SEARCH TERM OR SELECT A COLLECTION."}
          </p>
        </header>

        {/* This handles the Grid and the Modal entirely! */}
        <SearchResults initialResults={results || []} />

      </div>
    </main>
  );
}