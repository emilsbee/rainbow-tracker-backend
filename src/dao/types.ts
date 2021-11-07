export type DaoResponse<T> = {
    error: string;
    status: number;
    data: T;
};

export type QueryType = {
    name: string;
    text: string;
    values: any[];
};
