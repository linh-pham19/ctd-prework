import { renderCurrentPage, fetchItems, limit, currentPage, hideLoadingSpinner, showLoadingSpinner } from './helper.js';

let allArtworks = []; // Array to store all fetched artworks
// decided to use artworksToDisplay to store the artworks that are currently being displayed
// either the full list or searched results
let artworksToDisplay = []; 

let allProducts = [];

// Select view buttons and containers
const artworksViewButton = document.querySelector('#artworksViewButton');
const storeViewButton = document.querySelector('#storeViewButton');
const artworksView = document.querySelector('#artworksView');
const storeView = document.querySelector('#storeView');

const showArtworksView = () => {
    artworksView.classList.remove('hidden');
    storeView.classList.add('hidden');
};

const showStoreView = () => {
    storeView.classList.remove('hidden');
    artworksView.classList.add('hidden');
};


artworksViewButton.addEventListener('click', showArtworksView);
storeViewButton.addEventListener('click', showStoreView);

// Show artworks view by default
showArtworksView();

const fetchAllArtworks = async () => {
    try {
        showLoadingSpinner(); 

        const { items: artworks } = await fetchItems({
            endpoint: 'https://api.artic.edu/api/v1/artworks',
            fetchAll: true,
            maxArtworks: 210,
            limit
        });

        allArtworks = artworks.filter(({ image_id }) => image_id); 
        artworksToDisplay = allArtworks;

        hideLoadingSpinner();
    } catch (error) {
        console.error('Error fetching artworks:', error);
        hideLoadingSpinner();
    }
};

const initializeArtworksView = async () => {
    // only fetch artworks if they haven't been fetched
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }

    renderCurrentPage(currentPage, artworksToDisplay, 'artworks');
};

const searchArtworks = (searchTerm) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allArtworks.filter(({ title, artist_display, place_of_origin }) => {
        return (
            title.toLowerCase().includes(lowerCaseSearchTerm) ||
            (artist_display && artist_display.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (place_of_origin && place_of_origin.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });
};

document.querySelector('#clearButton').addEventListener('click', () => {
    document.querySelector('#search').value = '';
    artworksToDisplay = allArtworks;
    renderCurrentPage(1, artworksToDisplay, 'artworks');
});

document.querySelector('#search').addEventListener('input', async () => {
    const searchTerm = document.querySelector('#search').value;

    // Ensure all artworks are fetched before searching
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    artworksToDisplay = searchArtworks(searchTerm);
    renderCurrentPage(currentPage, artworksToDisplay, 'artworks');
});

// Event listeners for view switching
document.querySelector('#artworksViewButton').addEventListener('click', () => {
    document.querySelector('#artworksView').classList.remove('hidden');
    document.querySelector('#storeView').classList.add('hidden');
    initializeArtworksView();
});

document.querySelector('#storeViewButton').addEventListener('click', () => {
    document.querySelector('#storeView').classList.remove('hidden');
    document.querySelector('#artworksView').classList.add('hidden');
    initializeStoreView();
});

const fetchAllProducts = async () => {
    try {
        showLoadingSpinner('products'); 
    
    const { items: products} = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/products',
        fetchAll: true,
        maxProducts: 210,
        limit
    })
    allProducts = products;
    hideLoadingSpinner(); 
} catch (error) {   
    hideLoadingSpinner();  
    console.error('Error fetching products:', error);
    document.querySelector('#content').innerHTML = `<p>Error loading products. Please try again later.</p>`;
}
}


const filterProductsByPrice = (priceRange) => {
    if (priceRange === 'all') {
        return allProducts;
    }
    
    return allProducts.filter(({ price_display }) => {
        // Skip products without price_display
        if (!price_display) return false;

        // Remove $ and other non-numeric characters from price_display
        const priceMatch = price_display.match(/\$\s*([0-9]+(\.[0-9]+)?)/) || 0;
        
          // If no match found, skip this product
          if (!priceMatch) return false;
        
          // Extract the numeric price value from the match
          const price = Number(priceMatch[1]) || 0;

        // Check if the price falls within the selected range
        switch (priceRange) {
            case '0-10':
                return price < 10;
            case '10-50':
                return price >= 10 && price < 50; 
            case '50-100':
                return price >= 50 && price < 100; 
            case '100+':
                return price >= 100; 
            default:
                return false;
        }
    });
};

document.querySelector('#priceFilter').addEventListener('change', () => {
    const priceRange = document.querySelector('#priceFilter').value;

    // Filter the products based on the selected price range
    const filteredProducts = filterProductsByPrice(priceRange);

    // Render the filtered products
    renderCurrentPage(1, filteredProducts, 'products');
});

const initializeStoreView = async () => {
    if (allProducts.length === 0) {
        await fetchAllProducts();
    }   

    renderCurrentPage(currentPage, allProducts, 'products');
};

initializeArtworksView();
