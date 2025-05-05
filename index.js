import { renderPagination, fetchItems, loadItems, renderCards } from './helper.js';
let currentPage = 1;
const limit = 30; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks

const fetchAllArtworks = async () => {
    const { items: artworks } = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/artworks',
        fetchAll: true,
        maxArtworks: 210,
        limit
    });
    // 
    console.log("after fetchItems()")
    allArtworks = artworks;
    console.log(`Fetched ${allArtworks.length} artworks in total.`);
};

// Load artworks and render them
const loadArtworks = (page) => {
    loadItems(
        allArtworks,
        page,
        limit,
        (artworks) => renderCards(artworks, 'artworks'), // Use renderCards for artworks
        '#content',
        // to handle page change triggered by pagination
        (newPage) => {
            currentPage = newPage;
            loadArtworks(currentPage);
        }
    );
};

// Fetch artworks and load the first page on page load
fetchAllArtworks().then(() => {
    loadArtworks(currentPage);
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
    document.querySelector('#content').innerHTML = renderArtworks(allArtworks);
    renderPagination({
        currentPage: 1,
        totalPages: Math.ceil(allArtworks.length / limit),
    });
});


document.querySelector('#search').addEventListener('input', async () => {
    const searchTerm = document.querySelector('#search').value;

    // Ensure all artworks are fetched before searching
    if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    const filteredArtworks = searchArtworks(searchTerm);

    // Render the searched artworks
    loadItems(
        filteredArtworks,
        1,
        limit,
        (artworks) => renderCards(artworks, 'artworks'),
        '#content',
        (newPage) => {
            loadItems(filteredArtworks, newPage, limit, (artworks) => renderCards(artworks, 'artworks'), '#content', (newPage) => { });
        }
    );
});
