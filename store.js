import {fetchItems, renderCards, loadItems } from './helper.js';
let currentPage =1;
let allProducts = []; // Array to store all fetched products
const limit = 30; // Number of products per page

const fetchAllProducts = async () => {
    const { items: products} = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/products',
        fetchAll: true,
        maxProducts: 210,
        limit
    })
    allProducts = products;
}

const loadProducts = async (page) => {
    loadItems(
    allProducts,
    page,
    limit, 
    (products) => renderCards(products, 'products'), // Use renderCards for products
    '#content',
    (newPage) => {
        currentPage = newPage;
        loadProducts(currentPage);
    }
    );  
};

fetchAllProducts().then(() => {
    loadProducts(currentPage);
});

// create a function to handle click return to artworks
document.querySelector(`#storeLink`).onclick = () => {
    window.location.href = `index.html`;
}

