import { renderPagination, fetchItems, loadItems, renderCards, hideLoading, showLoading } from './helper.js';
let currentPage = 1;
const limit = 30; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks
// decided to use artworksToDisplay to store the artworks that are currently being displayed
// either the full list or searched results
let artworksToDisplay = []; // Array to store the current page of artworks
const fetchAllArtworks = async () => {
    try {
        showLoading(); 

        const { items: artworks } = await fetchItems({
            endpoint: 'https://api.artic.edu/api/v1/artworks',
            fetchAll: true,
            maxArtworks: 210,
            limit: 30
        });

        allArtworks = artworks.filter(({ image_id }) => image_id); // Filter out artworks without images
        artworksToDisplay = allArtworks;

        hideLoading(); // Hide spinner after successful load
    } catch (error) {
        console.error('Error fetching artworks:', error);
        hideLoading(); // Hide spinner even if there's an error
    }
};

// Render the current page of artworks
const renderCurrentPage = (page) => {
    try {
        loadItems(
            artworksToDisplay, // Use artworksToDisplay for pagination
            page,
            limit,
            (paginatedArtworks) => renderCards(paginatedArtworks, 'artworks'),
            '#content',
            (nextPage) => {
                currentPage = nextPage; // Update the current page
                renderCurrentPage(currentPage); // Reload the new page
            }
        );

        hideLoading(); // Hide spinner after rendering the page
    } catch (error) {
        console.error('Error rendering artworks:', error);
        hideLoading(); // Hide spinner even if there's an error
    }
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
