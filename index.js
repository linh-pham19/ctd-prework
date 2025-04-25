let currentPage = 1;
const limit = 9; // Number of artworks per page

// Fetch artworks from the API
const getArtworks = async (page=1, limit) => {
    const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.data);
        console.log(data.pagination)
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

// Render artworks as cards
const renderArtworks = (artworks) => {
    return artworks
        .filter(({image_id}) => image_id !== null) 
        .map(({ title, artist_display, image_id, place_of_origin}) => {
            console.log("length", artworks.length);
            const imageUrl = `https://www.artic.edu/iiif/2/${image_id}/full/200,/0/default.jpg`;
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
    try {
        // Clear any previous error message
        document.querySelector('#message').textContent = '';

        const { artworks, pagination } = await getArtworks(page, limit);
        document.querySelector('#content').innerHTML = renderArtworks(artworks);
        renderPagination(pagination);
    } catch (err) {
        document.querySelector('#message').textContent = `Error: ${err.message}`;
    }
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

// Initial load
loadArtworks(currentPage);



