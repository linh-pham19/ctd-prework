export const renderPagination = (pagination) => {
    const { currentPage, totalPages } = pagination;
    document.querySelector('#pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.querySelector('#prevPage').disabled = currentPage === 1;
    document.querySelector('#nextPage').disabled = currentPage === totalPages;
};