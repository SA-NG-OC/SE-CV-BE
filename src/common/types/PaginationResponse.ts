export class PaginationResponse<T> {
    data: T[];
    meta: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };

    constructor(data: T[], page: number, limit: number, totalItems: number) {
        const safePage = Math.max(page, 1);
        const safeLimit = Math.max(limit, 1);

        this.data = data;
        this.meta = {
            currentPage: safePage,
            itemsPerPage: safeLimit,
            totalItems,
            totalPages: Math.ceil(totalItems / safeLimit),
        };
    }
}