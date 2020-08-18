export default interface Quote {
  author: string;
  quote: string;
  shortId: string;
  meta: {
    authorCachedName: string;
    createdBy: string;
    createdByCachedName: string;
    createdAt: Date;
  };
}
