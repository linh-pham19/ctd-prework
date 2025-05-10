import {fetchItems, renderCards, loadItems, showLoading, hideLoading } from './helper.js';
let currentPage =1;
let allProducts = []; // Array to store all fetched products
const limit = 30; // Number of products per page

const fetchAllProducts = async () => {
    try {
        showLoading('products'); 
    
    const { items: products} = await fetchItems({
        endpoint: 'https://api.artic.edu/api/v1/products',
        fetchAll: true,
        maxProducts: 210,
        limit
    })
    allProducts = products;
    hideLoading('products'); // Hide spinner after loading
} catch (error) {   
    hideLoading('products');  
    console.error('Error fetching products:', error);
    document.querySelector('#content').innerHTML = `<p>Error loading products. Please try again later.</p>`;
}
}

const loadProducts = async (page) => {
    try {
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
    hideLoading('products')
} catch (error) {
    console.error('Error loading products:', error);
    hideLoading('products');
    document.querySelector('#content').innerHTML = `<p>Error loading products. Please try again later.</p>`;
};
}

fetchAllProducts().then(() => {
    showLoading('products');
    loadProducts(currentPage);
    hideLoading('products');
});

// create a function to handle click return to artworks
document.querySelector(`#storeLink`).onclick = () => {
    window.location.href = `index.html`;
}
