import { renderPagination } from './helper.js';
let currentPage =1;
let allProducts = []; // Array to store all fetched products
const limit = 105; // Number of products per page
const maxProducts = 210; // Maximum number of products to fetch

const fetchProducts = async ({ page = 1, limit = 100, fetchAll = false, maxProducts = 210 } = {}) => {
    let currentPage = page;
    let totalPages = 0;

    try {
        do {
            const url = `https://api.artic.edu/api/v1/products?page=${page}&limit=${limit}`;
            const data = await fetch(url);

            const {data: products, pagination} = await data.json();

            // Extract products and pagination info
            allProducts = allProducts.concat(products);
            totalPages = pagination.total_pages;

            // Stop if fetching a single page or reaching the max limit
            if (!fetchAll || allProducts.length >= maxProducts) {
                break;
            }
            currentPage++;
        } while (currentPage <= totalPages);

        // Trim the array if it exceeds the maxArtworks limit
        if (allProducts.lenght > maxProducts){
            allProducts = allProducts.slice(0, maxProducts);
        }
        return {
            products: allProducts,
            pagination: {
                currentPage,
                totalPages: Math.ceil(allProducts.length / limit),
            },
        };
        } catch (error) {
            console.error("Error fetching products:", error.message);
            throw error;
        }

    // try {
    //     const response = await fetch(url);
    //     if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data = await response.json();
    //     console.log("data.data", data.data);
    //     return {
    //         products: data.data,
    //         pagination: {
    //             currentPage: data.pagination.current_page,
    //             totalPages: data.pagination.total_pages,
    //         },
    //     };
    // } catch (error) {
    //     console.error("Error fetching store products:", error.message);
    //     throw error;
    // } 
};

const fetchAllProducts = async () => {
    const {products} = await fetchProducts({fetchAll: true, maxProducts: 210});
    allProducts = products;
    console.log(`Fetched ${allProducts.length} products in total.`);
}
const renderProducts = (products) => {
    if (products.length === 0) {
        return `
        <div class="no-results">
            <h2>No products found</h2>
        </div>
        `;
    }

    return products
        .filter(({ image_url }) => image_url !== null)
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

const loadProducts = async (page) => {
    const startIndex = (page - 1) * limit;
       const endIndex = page * limit;
       const productsToDisplay = allProducts.slice(startIndex, endIndex);
        console.log("productsToDisplay", productsToDisplay);
       document.querySelector('#content').innerHTML = renderProducts(productsToDisplay);
       renderPagination({
           currentPage: page,
           totalPages: Math.ceil(allProducts.length / limit),
       }, 
       (newPage) => {
           currentPage = newPage;
           loadProducts(currentPage);
       });
};

fetchAllProducts().then(() => {
    loadProducts(currentPage);
});

// create a function to handle click return to artworks
document.querySelector(`#storeLink`).onclick = () => {
    window.location.href = `index.html`;
}

