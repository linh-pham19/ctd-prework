const getArtworks = async () => {
    const url = 'https://api.artic.edu/api/v1/artworks';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Return the artworks array
        return data.data; 
    } catch (error) {
        console.error("Error fetching artworks:", error.message);
        throw error;
    }
};

const renderArtworks = (artworks) => {
    return artworks.map(({ title, artist_display, image_id }) => {
        const imageUrl = `https://www.artic.edu/iiif/2/${image_id}/full/200,/0/default.jpg`;
        return `
            <div class="card">
                <img src="${imageUrl}" alt="${title}" class="card-image" />
                <div class="card-content">
                    <h3 class="card-title">${title}</h3>
                    <p class="card-artist">${artist_display || "Unknown Artist"}</p>
                </div>
            </div>
        `;
    }).join('');
};

(async () => {
    try {
        // Fetch the artworks
        const artworks = await getArtworks();

        // Render the artworks in the #content div
        document.querySelector('#content').innerHTML = `<ul>${renderArtworks(artworks)}</ul>`;
    } catch (err) {
        // Show the error message
        document.querySelector('#message').textContent = err.message;
    }
})();


