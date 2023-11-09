export interface IPaginationRequestQuery {
  cursor?: number;
  take?: number;
}

export interface IPaginationMetadata {
  cursor: number;
  take: number;
  totalCount: number;
  totalPage: number;
  hasNextPage: boolean;
}
