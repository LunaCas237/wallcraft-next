import { supabase } from '../lib/supabase';
import SearchInput from '../components/SearchInput'; 
import SearchResults from '../components/SearchResult'; // Your component import

export default async function SearchPage(props: {
  // 1. Added 'matches' to the expected URL parameters
  searchParams: Promise<{ q?: string; category?: string; matches?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const category = searchParams.category || '';
  const matches = searchParams.matches || ''; // 2. Read the image matches from the URL

  let supabaseQuery = supabase.from('products').select('*');

  // 3. Update the query logic to handle image matches vs text search
  if (matches) {
    // If the URL has image matches, grab only those specific IDs
    const idArray = matches.split(',');
    supabaseQuery = supabaseQuery.in('id', idArray);
  } else {
    // Otherwise, do the normal text and category dropdown search
    if (category) supabaseQuery = supabaseQuery.eq('collection_type', category);
    if (query) supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`);
  }

  const { data: results, error } = await supabaseQuery;

  if (error) {
    console.error("Supabase Error:", error);
  }

  // Determine what the text below the search bar should say
  let subheaderText = "ENTER A SEARCH TERM OR SELECT A COLLECTION.";
  if (matches) subheaderText = "SHOWING VISUAL SEARCH RESULTS";
  else if (query || category) subheaderText = "SHOWING RESULTS";

  return (
    <main className="min-h-screen bg-black pt-32 px-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-8">
          <h1 className="text-[11px] uppercase tracking-[0.6em] text-[#B08038] mb-8">
            Explore Wallcraft
          </h1>
          
          <SearchInput />
          
          <p className="text-[#c2bfb6] text-[10px] uppercase tracking-[0.3em] mb-8">
            {subheaderText}
          </p>
        </header>

        {/* This handles the Grid and the Modal entirely! */}
        <SearchResults initialResults={results || []} />

      </div>
    </main>
  );
}