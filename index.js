import { renderPagination, fetchItems, loadItems, renderCards, hideLoading, showLoading } from './helper.js';
let currentPage = 1;
const limit = 30; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks
let currentArtworks = []; // Array to store the current page of artworks
const fetchAllArtworks = async () => {
    showLoading(); // Show spinner while loading

    const { items: artworks } = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/artworks',
        fetchAll: true,
        maxArtworks: 210,
        limit
    });
    hideLoading(); // Hide spinner after loading
    console.log("after fetchItems()", artworks.length)
    allArtworks = artworks.filter(({image_id}) => image_id); // Filter out artworks without images);
    currentArtworks = allArtworks;
    console.log(`Fetched ${allArtworks.length} artworks in total.`);
};

// Load artworks and render them
// const loadArtworks = (page) => {
//     loadItems(
//         allArtworks,
//         page,
//         limit,
//         (artworks) => renderCards(artworks, 'artworks'), // Use renderCards for artworks
//         '#content',
//         // to handle page change triggered by pagination
//         (newPage) => {
//             currentPage = newPage;
//             loadArtworks(currentPage);
//         }
//     );
// };
// Render the current page of artworks
const renderCurrentPage = (page) => {
    loadItems(
        currentArtworks, // Use currentArtworks for pagination
        page,
        limit,
        (artworks) => renderCards(artworks, 'artworks'),
        '#content',
        (newPage) => {
            currentPage = newPage; // Update the current page
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
    document.querySelector('#content').innerHTML = renderCards(allArtworks,"artworks");
    console.log("totalPages",allArtworks.length / limit);
    currentArtworks = allArtworks;
    renderCurrentPage(1);
    // renderPagination({
    //     currentPage: 1,
    //     totalPages: Math.ceil(allArtworks.length / limit),
    // });
});


document.querySelector('#search').addEventListener('input', async () => {
    const searchTerm = document.querySelector('#search').value;

    // Ensure all artworks are fetched before searching
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    currentArtworks = searchArtworks(searchTerm);
    console.log("filteredArtworks", currentArtworks);
    renderCurrentPage(1);
    // Render the searched artworks
    // loadItems(
    //     filteredArtworks,
    //     1,
    //     limit,
    //     (artworks) => renderCards(artworks, 'artworks'),
    //     '#content',
    //     (newPage) => {
    //         loadItems(filteredArtworks, newPage, limit, (artworks) => renderCards(artworks, 'artworks'), '#content', (newPage) => { });
    //     }
    // );
});
