/**
 * Spring Data の Page レスポンスを扱うヘルパー。
 *
 * バックエンドは @EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO) のため、
 * ページ情報は { content, page: { size, number, totalElements, totalPages } } の入れ子で返る。
 * 旧形式（トップレベルに totalPages / totalElements）にも念のため対応する。
 */
export interface PageResponse<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  // 旧形式（DIRECT モード）
  totalPages?: number;
  totalElements?: number;
}

export interface PageMeta {
  totalPages: number;
  totalElements: number;
}

export const pageMeta = <T>(res: PageResponse<T>): PageMeta => ({
  totalPages: res.page?.totalPages ?? res.totalPages ?? 1,
  totalElements: res.page?.totalElements ?? res.totalElements ?? res.content.length,
});
