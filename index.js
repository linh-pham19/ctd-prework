import { renderCurrentPage, fetchItems, limit, currentPage, hideLoading, showLoading } from './helper.js';


let allArtworks = []; // Array to store all fetched artworks
// decided to use artworksToDisplay to store the artworks that are currently being displayed
// either the full list or searched results
let artworksToDisplay = []; 

let allProducts = [];

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

fetchAllArtworks().then(() => {
    console.log('All artworks fetched:', artworksToDisplay);
    renderCurrentPage(currentPage, artworksToDisplay, 'artworks');
});

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
    console.log("items searched", artworksToDisplay)
    renderCurrentPage(currentPage, artworksToDisplay, 'artworks');
    // console.log("items searched", artworksToDisplay)
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
    hideLoading('products'); // Hide spinner after loading
} catch (error) {   
    hideLoading('products');  
    console.error('Error fetching products:', error);
    document.querySelector('#content').innerHTML = `<p>Error loading products. Please try again later.</p>`;
}
}

fetchAllProducts().then(() => {
    console.log('All products fetched:', allProducts);
    renderCurrentPage(currentPage, allProducts, 'products');
});