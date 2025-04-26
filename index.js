let currentPage = 1;
const limit = 105; // Number of artworks per page
let allArtworks = []; // Array to store all fetched artworks

// Fetch artworks from the API
const getArtworks = async (page=1, limit) => {
    // const url = `https://api.artic.edu/api/v1/products?page=${page}&limit=${limit}`;
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data.data",data.data);
        console.log("data.pagination",data.pagination)
        // Return the artworks array
        return {
            artworks: data.data,
            pagination: {
                current_page: data.pagination.current_page,
                total_pages: data.pagination.total_pages
            }
        }; 
    } catch (error) {
        console.error("Error fetching artworks:", error.message);
        throw error;
    }
};

const fetchAllArtworks = async () => {
    let page = 1;
    const maxArtworks = 210;
    const limit = 100;

    try {
        while (allArtworks.length < maxArtworks) {
            const { artworks, pagination } = await getArtworks(page, limit);
            console.log("artworks",artworks.length)
            allArtworks = allArtworks.concat(artworks);

            if (allArtworks.length >= maxArtworks) {
                console.log(`Fetched ${allArtworks.length} artworks, stopping at max limit.`);
                allArtworks = allArtworks.slice(0, maxArtworks);
                console.log("allArtworks after slice",allArtworks.length)
                break;
            }

            page++;
            if (page > pagination.total_pages) {
                break;
            }
        }

        console.log(`Fetched ${allArtworks.length} artworks in total.`);
    } catch (err) {
        console.error(`Error fetching all artworks: ${err.message}`);
    }
};

// Render artworks as cards
const renderArtworks = (artworks) => {
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

// Function to render pagination
const renderPagination = (pagination) => {
    const { current_page, total_pages } = pagination;
    document.querySelector('#pageInfo').textContent = `Page ${current_page} of ${total_pages}`;
    document.querySelector('#prevPage').disabled = current_page === 1;
    document.querySelector('#nextPage').disabled = current_page === total_pages;
};

// Function to load artworks and render them
const loadArtworks = async (page) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const artworksToDisplay = allArtworks.slice(startIndex, endIndex);

    document.querySelector('#content').innerHTML = renderArtworks(artworksToDisplay);
    renderPagination({
        current_page: page,
        total_pages: Math.ceil(allArtworks.length / limit),
    });
};

// Event listeners for pagination buttons
document.querySelector('#prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadArtworks(currentPage);
    }
});

document.querySelector('#nextPage').addEventListener('click', () => {
    currentPage++;
    loadArtworks(currentPage);
});

// Fetch artworks and load the first page on page load
fetchAllArtworks().then(() => {
    loadArtworks(currentPage);
});

const searchArtworks = (searchTerm) => {
    console.log("allArtworks",allArtworks)
    return allArtworks.filter(({ title, artist_display, place_of_origin }) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        console.log("title",title)
        console.log("artist_display",artist_display)
        console.log("place_of_origin",place_of_origin)
        return (
            title.toLowerCase().includes(lowerCaseSearchTerm) ||
            (artist_display && artist_display.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (place_of_origin && place_of_origin.toLowerCase().includes(lowerCaseSearchTerm))
        );
    });
};

document.querySelector('#search').addEventListener('input', async() => {
    const searchTerm = document.querySelector('#search').value;
    console.log("searchTerm",searchTerm)
console.log("allArtworks in input",allArtworks)
     // Ensure all artworks are fetched before searching
     if (allArtworks.length === 0) {
        await fetchAllArtworks();
    }
    const filteredArtworks = searchArtworks(searchTerm);

    // Render the filtered artworks
    document.querySelector('#content').innerHTML = renderArtworks(filteredArtworks);

    // Update pagination (optional, depending on your logic)
    renderPagination({
        current_page: 1,
        total_pages: Math.ceil(filteredArtworks.length / limit),
    });
});

// Initial load
loadArtworks(currentPage);




