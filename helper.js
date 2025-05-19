export const limit = 30; // Number of artworks per page
export let currentPage = 1;

export const renderPagination = (pagination, onPageChange) => {
    const { currentPage, totalPages, containerSelector } = pagination;
    let pageType = '';
    containerSelector === '#artwork-content' ? pageType = 'art' : pageType = 'prod';

    const prevButton = document.querySelector(`#${pageType}-prevPage`);
    const nextButton = document.querySelector(`#${pageType}-nextPage`);

    document.querySelector(`#${pageType}-pageInfo`).textContent = `Page ${currentPage} of ${totalPages}`;
    document.querySelector(`#${pageType}-prevPage`).disabled = currentPage === 1;
    document.querySelector(`#${pageType}-nextPage`).disabled = currentPage === totalPages;

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
    console.log("items",items)
    const paginatedItems = items.slice(startIndex, endIndex);

    // render the items
    document.querySelector(containerSelector).innerHTML = renderFunction(paginatedItems);

    renderPagination({
        containerSelector,
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

export const renderCurrentPage = (page, items, type) => {
    console.log("Rendering page:", page, "Type:", type);
    try {
        console.log("type"      , type)
        loadItems(
            items,
            page,
            limit,
            (paginatedItems) => renderCards(paginatedItems, type),
            type === 'artworks'? '#artwork-content': '#product-content',
            (nextPage) => {
                currentPage = nextPage; 
                renderCurrentPage(currentPage, items, type);
            }
        );

        hideLoadingSpinner(); 
    } catch (error) {
        console.error('Error rendering artworks:', error);
        hideLoadingSpinner(); 
    }
};

export const showLoadingSpinner = () => {
};

export const hideLoadingSpinner = () => {
    document.querySelector('#loading').classList.add('hidden'); 
};