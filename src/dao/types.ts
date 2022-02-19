export type DaoResponse<T> = {
    error: string;
    status: number;
    data: T;
    success: boolean;
};

export type QueryType = {
    name: string;
    text: string;
    values: any[];
};
