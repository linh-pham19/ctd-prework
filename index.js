import { renderCurrentPage, fetchItems, limit, currentPage, hideLoading, showLoading } from './helper.js';


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

// Function to show the Artworks view
const showArtworksView = () => {
    // console.log("artworksView", artworksView)
    artworksView.classList.remove('hidden');
    storeView.classList.add('hidden');
};

// Function to show the Store view
const showStoreView = () => {
    console.log("storeView", storeView)
    storeView.classList.remove('hidden');
    artworksView.classList.add('hidden');
};

// Event listeners for view buttons
artworksViewButton.addEventListener('click', showArtworksView);
storeViewButton.addEventListener('click', showStoreView);

// Default to Artworks view on page load
showArtworksView();
const fetchAllArtworks = async () => {
    try {
        showLoading(); 

        const { items: artworks } = await fetchItems({
            endpoint: 'https://api.artic.edu/api/v1/artworks',
            fetchAll: true,
            maxArtworks: 210,
            limit
        });

        allArtworks = artworks.filter(({ image_id }) => image_id); 
        artworksToDisplay = allArtworks;

        hideLoading();
    } catch (error) {
        console.error('Error fetching artworks:', error);
        hideLoading();
    }
};

const initializeArtworksView = async () => {
    // only fetch artworks if they haven't been fetched
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    // console.log('All artworks fetched:', artworksToDisplay);
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
    // console.log("items searched", artworksToDisplay)
    renderCurrentPage(currentPage, artworksToDisplay, 'artworks');
    // console.log("items searched", artworksToDisplay)
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
        showLoading('products'); 
    
    const { items: products} = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/products',
        fetchAll: true,
        maxProducts: 210,
        limit
    })
    allProducts = products;
    hideLoading(); // Hide spinner after loading
} catch (error) {   
    hideLoading();  
    console.error('Error fetching products:', error);
    document.querySelector('#content').innerHTML = `<p>Error loading products. Please try again later.</p>`;
}
}

const initializeStoreView = async () => {
    if (allProducts.length === 0) {
        await fetchAllProducts();
    }   
    // console.log('All products fetched:', allProducts);
    renderCurrentPage(currentPage, allProducts, 'products');
};

initializeArtworksView();

// document.querySelector(`#storeLink`).onclick = () => {
//     window.location.href = `index.html`;
// }