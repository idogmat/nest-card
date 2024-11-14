import { ParsedQs } from "qs";

export class PaginationOutput<D> {
  public readonly pagesCount: number;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly totalCount: number;
  public readonly items: D[];

  constructor(items: D[], page: number, pageSize: number, totalCount: number) {
    this.pagesCount = Math.ceil(totalCount / pageSize);
    this.page = page;
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.items = items;

  }
}

export class Pagination {
  public readonly pageNumber: number;
  public readonly pageSize: number;
  public readonly sortDirection: SortDirectionType;
  public readonly sortBy: string;

  constructor(query: ParsedQs, sortProperties: string[]) {
    this.sortBy = this.getSortBy(query, sortProperties);
    this.sortDirection = this.getSortDirection(query);
    this.pageNumber = Number(query.pageNumber ?? 1);
    this.pageSize = Number(query.pageSize ?? 10);
  }

  public getSkipItemsCount() {
    return (this.pageNumber - 1) * this.pageSize;
  }

  private getSortDirection(query: ParsedQs): SortDirectionType {
    let sortDirection: SortDirectionType = "DESC";

    switch (query.sortDirection) {
      case "desc": {
        sortDirection = "DESC";
        break;
      }
      case "asc": {
        sortDirection = "ASC";
        break;
      }
    }
    return sortDirection;
  }

  private getSortBy(query: ParsedQs, sortProperties: string[]): string {
    let result = "createdAt";

    const querySortBy = query.sortBy;

    if (querySortBy === undefined) {
      return result;
    }

    // If query property sent as Array
    if (Array.isArray(querySortBy)) {

      for (let i: number = 0; i < querySortBy.length; i++) {
        const param = querySortBy[i];

        if (sortProperties.includes(param.toString())) {
          result = param.toString();
          break;
        }
      }
    } else {
      if (sortProperties.includes(querySortBy.toString())) {
        result = querySortBy.toString();
      }
    }

    return result;
  }
}

export class PaginationWithSearchLoginAndEmailTerm extends Pagination {
  public readonly searchLoginTerm: string | null;
  public readonly searchEmailTerm: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.searchLoginTerm = query.searchLoginTerm?.toString() || null;
    this.searchEmailTerm = query.searchEmailTerm?.toString() || null;
  }
}

export class PaginationWithSearchBlogNameTerm extends Pagination {
  public readonly searchNameTerm: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.searchNameTerm = query.searchNameTerm?.toString() || null;
  }
}

export class PaginationPostSearchBlogNameTerm extends Pagination {
  public readonly searchTitleTerm: string | null;
  public readonly searchBlogNameTerm: string | null;

  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.searchTitleTerm = query.searchNameTerm?.toString() || null;
    this.searchBlogNameTerm = query.searchBlogNameTerm?.toString() || null;
  }
}

export class PaginationQuestionBodySearchTerm extends Pagination {
  public readonly bodySearchTerm: string | null;
  public readonly publishedStatus: boolean | null;
  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.bodySearchTerm = query.bodySearchTerm?.toString() || null;
    this.publishedStatus = this.getPublishedType(query);
  }

  private getPublishedType(query: ParsedQs): boolean | null {
    let result = null;
    switch (query.publishedStatus) {
      case "published": {
        result = true;
        break;
      }
      case "notPublished": {
        result = false;
        break;
      }
      default:
        break;
    }
    return result;
  }
}

export class PaginationAllStatistic extends Pagination {
  public readonly sort: string | null;
  public readonly destination: string | null;
  constructor(query: ParsedQs, sortProperties: string[]) {
    super(query, sortProperties);

    this.sort = query.sort?.toString() || null;
    this.destination = query.destination?.toString() || null;
  }
  // private getSort(query: ParsedQs): boolean | null {
  //   let sort = 'avgScores';
  //   let destination = 'desc'
  //   console.log(query.publishedStatus);
  //   switch (query.publishedStatus) {
  //     case "published": {
  //       result = true;
  //       break;
  //     }
  //     case "notPublished": {
  //       result = false;
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  //   return result;
  // }
}
// TYPES

export type SortDirectionType = "DESC" | "ASC";

export type PaginationType = {
  searchNameTerm: string | null,
  sortBy: string,
  sortDirection: SortDirectionType,
  pageNumber: number,
  pageSize: number;
};