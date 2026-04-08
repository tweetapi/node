import { describe, it, expect, vi, beforeEach } from "vitest";
import { paginate, paginatePages } from "../src/pagination";
import type { PaginatedResponse } from "../src/types/common";

describe("paginatePages", () => {
  it("should iterate all pages until nextCursor is null", async () => {
    const fetcher = vi
      .fn<(cursor?: string) => Promise<PaginatedResponse<{ id: string }>>>()
      .mockResolvedValueOnce({
        data: [{ id: "1" }, { id: "2" }],
        pagination: { nextCursor: "c2", prevCursor: null },
      })
      .mockResolvedValueOnce({
        data: [{ id: "3" }],
        pagination: { nextCursor: "c3", prevCursor: "c2" },
      })
      .mockResolvedValueOnce({
        data: [{ id: "4" }],
        pagination: { nextCursor: null, prevCursor: "c3" },
      });

    const pages: PaginatedResponse<{ id: string }>[] = [];
    for await (const page of paginatePages(fetcher)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(3);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenNthCalledWith(1, undefined);
    expect(fetcher).toHaveBeenNthCalledWith(2, "c2");
    expect(fetcher).toHaveBeenNthCalledWith(3, "c3");
  });

  it("should respect maxPages", async () => {
    const fetcher = vi
      .fn<(cursor?: string) => Promise<PaginatedResponse<{ id: string }>>>()
      .mockResolvedValueOnce({
        data: [{ id: "1" }],
        pagination: { nextCursor: "c2", prevCursor: null },
      })
      .mockResolvedValueOnce({
        data: [{ id: "2" }],
        pagination: { nextCursor: "c3", prevCursor: "c2" },
      });

    const pages: PaginatedResponse<{ id: string }>[] = [];
    for await (const page of paginatePages(fetcher, { maxPages: 2 })) {
      pages.push(page);
    }

    expect(pages).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("should handle a single page with no nextCursor", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({
      data: [{ id: "1" }],
      pagination: { nextCursor: null, prevCursor: null },
    });

    const pages = [];
    for await (const page of paginatePages(fetcher)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("should handle empty data", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({
      data: [],
      pagination: { nextCursor: null, prevCursor: null },
    });

    const pages = [];
    for await (const page of paginatePages(fetcher)) {
      pages.push(page);
    }

    expect(pages).toHaveLength(1);
    expect(pages[0].data).toEqual([]);
  });

  it("should propagate errors", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: "1" }],
        pagination: { nextCursor: "c2", prevCursor: null },
      })
      .mockRejectedValueOnce(new Error("API error"));

    const pages = [];
    await expect(async () => {
      for await (const page of paginatePages(fetcher)) {
        pages.push(page);
      }
    }).rejects.toThrow("API error");

    expect(pages).toHaveLength(1);
  });
});

describe("paginate", () => {
  it("should yield individual items from all pages", async () => {
    const fetcher = vi
      .fn<(cursor?: string) => Promise<PaginatedResponse<{ id: string }>>>()
      .mockResolvedValueOnce({
        data: [{ id: "1" }, { id: "2" }],
        pagination: { nextCursor: "c2", prevCursor: null },
      })
      .mockResolvedValueOnce({
        data: [{ id: "3" }],
        pagination: { nextCursor: null, prevCursor: "c2" },
      });

    const items: { id: string }[] = [];
    for await (const item of paginate(fetcher)) {
      items.push(item);
    }

    expect(items).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
  });

  it("should respect maxPages when yielding items", async () => {
    const fetcher = vi
      .fn<(cursor?: string) => Promise<PaginatedResponse<{ id: string }>>>()
      .mockResolvedValueOnce({
        data: [{ id: "1" }],
        pagination: { nextCursor: "c2", prevCursor: null },
      })
      .mockResolvedValueOnce({
        data: [{ id: "2" }],
        pagination: { nextCursor: "c3", prevCursor: "c2" },
      });

    const items: { id: string }[] = [];
    for await (const item of paginate(fetcher, { maxPages: 1 })) {
      items.push(item);
    }

    expect(items).toEqual([{ id: "1" }]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
