export type DaoError = string;

export type DaoResponse<T> = {
    error: DaoError;
}
