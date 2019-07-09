declare module "*.graphql" {
  // c.f. https://github.com/apollographql/graphql-tag/issues/59
  import { DocumentNode } from "graphql";

  const value: DocumentNode;
  export default value;
}
