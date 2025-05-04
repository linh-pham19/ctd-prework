import {renderPagination, fetchData} from './helper.js';
let currentPage = 1;
const limit = 105; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks

const fetchArtworks = async 
// const fetchArtworks = async ({ page = 1, limit = 100, fetchAll = false, maxArtworks = 210 } = {}) => {
//     let currentPage = page;
//     let totalPages = 0;

//     try {
//         do {
//             const url = `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${limit}`;
//             const data = await fetchData(url);

//             // Extract artworks and pagination info
//             const { data: artworks, pagination } = data;

//             // Add fetched artworks to the array
//             allArtworks = allArtworks.concat(artworks);
//             totalPages = pagination.total_pages;

//             // Stop if fetching a single page or reaching the max limit
//             if (!fetchAll || allArtworks.length >= maxArtworks) {
//                 break;
//             }

//             currentPage++;
//         } while (currentPage <= totalPages);

//         // Trim the array if it exceeds the maxArtworks limit
//         if (allArtworks.length > maxArtworks) {
//             allArtworks = allArtworks.slice(0, maxArtworks);
//         }

//         return {
//             artworks: allArtworks,
//             pagination: {
//                 currentPage,
//                 totalPages: Math.ceil(allArtworks.length / limit),
//             },
//         };
//     } catch (error) {
//         console.error("Error fetching artworks:", error.message);
//         throw error;
//     }
// };

const fetchAllArtworks = async () => {
    const { artworks } = await fetchArtworks({ fetchAll: true, maxArtworks: 210 });
    allArtworks = artworks;
    console.log(`Fetched ${allArtworks.length} artworks in total.`);
};

// Render artworks as cards
const renderArtworks = (artworks) => {
    if (artworks.length === 0) {
        return `
            <div class="no-results">
                <h2>No artworks found</h2>
            </div>
        `;
    }
    return artworks
        .filter(({image_id}) => image_id !== null) 
        .map(({ title, artist_display, image_id, place_of_origin}) => {
            console.log("length", artworks.length);
            const imageUrl = `https://www.artic.edu/iiif/2/${image_id}/full/200,/0/default.jpg`;
            // const imageUrl = `${image_url}`;
            return `
                <div class="card">
                    <img src="${imageUrl}" alt="${title}" class="card-image" />
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-artist">${artist_display || "Unknown Artist"}</p>
                        <p class="card-origin">Origin: ${place_of_origin || "Unknown Origin"}</p>
                    </div>
                </div>
            `;
        })
        .join('');
};

// Function to load artworks and render them
const loadArtworks = async (page) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const artworksToDisplay = allArtworks.slice(startIndex, endIndex);

    document.querySelector('#content').innerHTML = renderArtworks(artworksToDisplay);
    renderPagination({
        currentPage: page,
        totalPages: Math.ceil(allArtworks.length / limit),
    }, 
    (newPage) => {
        currentPage = newPage;
        loadArtworks(currentPage);
    });
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


document.querySelector('#search').addEventListener('input', async() => {
    const searchTerm = document.querySelector('#search').value;

     // Ensure all artworks are fetched before searching
     if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    const filteredArtworks = searchArtworks(searchTerm);

    // Render the searched artworks
    document.querySelector('#content').innerHTML = renderArtworks(filteredArtworks);
});
