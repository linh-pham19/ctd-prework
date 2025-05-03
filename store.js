import { renderPagination } from './helper.js';
const getStoreProducts = async (page = 1, limit = 100) => {
    const url = `https://api.artic.edu/api/v1/products?page=${page}&limit=${100}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data.data", data.data);
        return {
            products: data.data,
            pagination: {
                currentPage: data.pagination.current_page,
                totalPages: data.pagination.total_pages,
            },
        };
    } catch (error) {
        console.error("Error fetching store products:", error.message);
        throw error;
    } 
};

const renderStoreProducts = (products) => {
    return products
        .map(({ title, image_url, price_display }) => {
            return `
                <div class="card">
                    <img src="${image_url}" alt="${title}" class="card-image" />
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <p class="card-description">Price: ${price_display}</p>
                    </div>
                </div>
            `;
        })
        .join('');
};

const loadStoreProducts = async (page) => {
    try {
        const { products, pagination } = await getStoreProducts(page, 10);
        document.querySelector('#storeContent').innerHTML = renderStoreProducts(products);
        renderPagination(pagination);
    } catch (error) {
        console.error("Error loading store products:", error.message);
    }
};

let currentStorePage = 1;

document.querySelector('#prevPage').addEventListener('click', () => {
    if (currentStorePage > 1) {
        currentStorePage--;
        loadStoreProducts(currentStorePage);
    }
});

document.querySelector('#nextPage').addEventListener('click', () => {
    currentStorePage++;
    loadStoreProducts(currentStorePage);
});

document.querySelector('#storeLink').addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate to index.html
});
// Load the first page of store products on page load
loadStoreProducts(currentStorePage);