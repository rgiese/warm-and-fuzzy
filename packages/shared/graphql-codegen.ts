import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema/schema.graphql",
  generates: {
    "./src/generated/graphqlTypes.ts": {
      config: {
        scalars: { DateTime: "Date" },
      },
      plugins: ["typescript", { add: { content: "/* eslint-disable */" } }],
    },
  },
};

export default config;
