export interface Article {
  _id: string;
  title: string;
  body: string;
  category: string;
  /** Cover image — must be http(s) URL when set */
  imageUrl?: string;
  campus: string;
}
