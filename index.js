import { renderPagination, fetchItems, loadItems, renderCards, hideLoading, showLoading } from './helper.js';
let currentPage = 1;
const limit = 30; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks
// decided to use artworksToDisplay to store the artworks that are currently being displayed
// either the full list or searched results
let artworksToDisplay = []; // Array to store the current page of artworks
const fetchAllArtworks = async () => {
    showLoading(); // Show spinner while loading

    // destructure the `items` out of `data` object and rename it to `artworks`
    const { items: artworks } = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/artworks',
        fetchAll: true,
        maxArtworks: 210,
        limit
    });
    
    hideLoading(); // Hide spinner after loading
    allArtworks = artworks.filter(({ image_id }) => image_id); // Filter out artworks without images);
    artworksToDisplay = allArtworks;
};

// Render the current page of artworks
const renderCurrentPage = (page) => {
    loadItems(
        artworksToDisplay, // Use artworksToDisplay for pagination
        page,
        limit,
        // paginatedArtworks is the sliced array of artworksToDisplay
        (paginatedArtworks) => renderCards(paginatedArtworks, 'artworks'),
        '#content',
        // next page number when navigating through the pagination
        (nextPage) => {
            currentPage = nextPage; // Update the current page
            renderCurrentPage(currentPage); // Reload the new page
        }
    );
};

// Fetch artworks and load the first page on page load
fetchAllArtworks().then(() => {
    renderCurrentPage(currentPage);
});

//SEARCH FUNCTIONALITY
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
    document.querySelector('#content').innerHTML = renderCards(allArtworks, "artworks");
    artworksToDisplay = allArtworks;
    renderCurrentPage(1);
});


document.querySelector('#search').addEventListener('input', async () => {
    const searchTerm = document.querySelector('#search').value;

    // Ensure all artworks are fetched before searching
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    artworksToDisplay = searchArtworks(searchTerm);
    renderCurrentPage(1);
});
