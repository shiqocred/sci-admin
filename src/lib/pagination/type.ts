export interface DataPaginationProps {
  last_page?: number;
  current_page?: number;
  from?: number;
  total?: number;
  per_page?: number;
}

export interface MetaPageProps {
  last: number;
  from: number;
  total: number;
  perPage: number;
}
