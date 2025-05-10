export const renderPagination = (pagination, onPageChange) => {
    const { currentPage, totalPages } = pagination;
    console.log("Total Pages:", totalPages);

    // Select the pagination buttons
    const prevButton = document.querySelector('#prevPage');
    const nextButton = document.querySelector('#nextPage');

    document.querySelector('#pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.querySelector('#prevPage').disabled = currentPage === 1;
    document.querySelector('#nextPage').disabled = currentPage === totalPages;

    // Disable buttons if on first or last page
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    // Logic to handle pagge changes
    prevButton.onclick = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    nextButton.onclick = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };
};

export const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("artworks",data.data)
        return data;
    } catch (error) {
        console.error("Error fetching data:", error.message);
        throw error;
    }
}

export const renderCards = (items, type) => {
    if (items.length === 0) {
        return `
        <div class="no-results">
        <h2> No ${type} found</h2>
        </div>
        `;
    }

    return items
        .filter(({ image_url, image_id }) => image_url || image_id)
        .map(({ title, image_url, image_id, price_display, artist_display, place_of_origin }) => {
            const imageUrl = image_url || `https://www.artic.edu/iiif/2/${image_id}/full/843,/0/default.jpg`;
            const artist = type = "products" && artist_display ? `<p class="card-artist">Artist: ${artist_display}</p>`: '';
            const origin = type = "products" && place_of_origin ? `<p class="card-price">Origin: ${place_of_origin}</p>` : '' ;
            const price = type = "products" && price_display ? `<p class="card-price">Price: ${price_display}</p>` : '';
            return `
                <div class="card">
                    <img src="${imageUrl}" alt="${title}" class="card-image" loading="lazy"/>
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                       ${artist}
                        ${origin}
                       ${price}
                    </div>
                </div>
            `;
        }
        ).join('');
};

// Slice the items (currentArtworks) array based on the current page and limit (number of items per page)
export const loadItems = (items, page, limit, renderFunction, containerSelector, onPageChange) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // sliced items for the current page
    const paginatedItems = items.slice(startIndex, endIndex);
    console.log(`Page: ${page}, Start Index: ${startIndex}, End Index: ${endIndex}, Items:`, paginatedItems);

    // render the items
    document.querySelector(containerSelector).innerHTML = renderFunction(paginatedItems);

    // render pagination
    renderPagination({
        currentPage: page,
        totalPages: Math.ceil(items.length / limit),
    },
        onPageChange);
}

export const fetchItems = async ({ endpoint, page = 1, limit = 100, fetchAll = false, maxItems = 210 } = {}) => {
    let allItems = [];
    let currentPage = page;
    let totalPages = 0;

    try {
        do {
            const url = `${endpoint}?page=${currentPage}&limit=${limit}`;
            const {data: items, pagination} = await fetchData(url);
            console.log("data from fetch",items)

            // Add fetched items to the array
            allItems = allItems.concat(items);
            totalPages = pagination.total_pages;

            // Stop if fetching a single page or reaching the max limit
            if (!fetchAll || allItems.length >= maxItems) {
                break;
            }

            currentPage++;
        } while (currentPage <= totalPages);

        // Trim the array if it exceeds the maxItems limit
        if (allItems.length > maxItems) {
            allItems = allItems.slice(0, maxItems);
        }

        return {
            items: allItems,
            pagination: {
                currentPage,
                totalPages: Math.ceil(allItems.length / limit),
            },
        };
    } catch (error) {
        console.error(`Error fetching items from ${endpoint}:`, error.message);
        throw error;
    }
};

export const showLoading = (type) => {
    document.querySelector('#loading').classList.remove('hidden'); // Show spinner
    if (type === 'artworks') {
        document.querySelector('#search-container').classList.add('hidden'); // Hide search bar
    }
    document.querySelector('#content').classList.add('hidden'); // Hide content
    document.querySelector('#pagination').classList.add('hidden'); // Hide pagination
};

export const hideLoading = (type) => {
    document.querySelector('#loading').classList.add('hidden'); // Hide spinner
    if (type === 'artworks') {
        document.querySelector('#search-container').classList.add('hidden'); // Hide search bar
    }
    document.querySelector('#content').classList.remove('hidden'); // Show content
    document.querySelector('#pagination').classList.remove('hidden'); // Show pagination
};