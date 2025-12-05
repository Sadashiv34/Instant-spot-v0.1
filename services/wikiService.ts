
export interface WikiPhoto {
  imageUrl: string;
  pageUrl: string;
}

// In-memory cache to store fetched photos
const photoCache = new Map<string, WikiPhoto | null>();

export const getWikiPhoto = async (placeName: string): Promise<WikiPhoto | null> => {
  // 1. Check Cache
  if (photoCache.has(placeName)) {
    return photoCache.get(placeName) || null;
  }

  try {
    // 2. Fetch from Wikimedia Commons API
    // action=query: Main query action
    // generator=search: Search for pages
    // gsrnamespace=6: Search in 'File' namespace (images/media)
    // gsrsearch: The search query (place name)
    // gsrlimit=1: We only need the top result
    // prop=pageimages: Get image info
    // pithumbsize=500: Request a 500px thumbnail (good balance of quality/size)
    // origin=*: Handle CORS
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(placeName)}&gsrlimit=1&prop=pageimages&pithumbsize=500&format=json&origin=*`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages) as any[];
      
      if (pages.length > 0 && pages[0].thumbnail?.source) {
        const page = pages[0];
        
        const result: WikiPhoto = {
            imageUrl: page.thumbnail.source,
            // Construct link to the file page
            pageUrl: `https://commons.wikimedia.org/?curid=${page.pageid}`
        };
        
        // 3. Save to Cache
        photoCache.set(placeName, result);
        return result;
      }
    }
  } catch (e) {
    console.warn("Wikimedia fetch failed", e);
  }
  
  // Cache null result to avoid retrying failed searches repeatedly
  photoCache.set(placeName, null);
  return null;
};
