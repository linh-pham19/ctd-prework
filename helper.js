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
        return data;
    } catch (error) {
        console.error("Error fetching data:", error.message);
        throw error;
    }
}