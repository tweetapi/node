import type { PaginatedResponse } from "./types/common";

/** Options for auto-pagination helpers. */
export interface PaginateOptions {
  /** Maximum number of pages to fetch. Default: Infinity (all pages). */
  maxPages?: number;
}

/**
 * Async generator that yields each full page from a paginated endpoint.
 *
 * @example
 * ```ts
 * for await (const page of paginatePages(
 *   (cursor) => client.user.getFollowers({ userId: "123", cursor }),
 * )) {
 *   console.log(`Got ${page.data.length} users`);
 * }
 * ```
 */
export async function* paginatePages<T>(
  fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>,
  options?: PaginateOptions,
): AsyncGenerator<PaginatedResponse<T>, void, undefined> {
  const maxPages = options?.maxPages ?? Infinity;
  let cursor: string | undefined;
  let count = 0;

  do {
    const page = await fetcher(cursor);
    yield page;
    count++;
    cursor = page.pagination.nextCursor ?? undefined;
  } while (cursor && count < maxPages);
}

/**
 * Async generator that yields individual items from all pages of a paginated endpoint.
 *
 * @example
 * ```ts
 * for await (const user of paginate(
 *   (cursor) => client.user.getFollowers({ userId: "123", cursor }),
 *   { maxPages: 5 },
 * )) {
 *   console.log(user.username);
 * }
 * ```
 */
export async function* paginate<T>(
  fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>,
  options?: PaginateOptions,
): AsyncGenerator<T, void, undefined> {
  for await (const page of paginatePages(fetcher, options)) {
    yield* page.data;
  }
}
