export * from './user/types';
export * from './category/types';
export * from './note/types';
export * from './week/types';

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
