const fs = require("fs");
const path = require("path");
const TJS = require("typescript-json-schema");

// Register types to be translated here
const typeRegistry = [
  { fileName: "ParticleWebhook_Status/statusEvent.ts", typeName: "StatusEvent" },
  { fileName: "schema/deviceConfiguration.ts", typeName: "DeviceConfiguration" },
  { fileName: "schema/deviceToTenant.ts", typeName: "DeviceToTenant" },
];

// Generate schemas
const targetDir = "./generated/schema";
fs.mkdirSync(targetDir, { recursive: true });

typeRegistry.map(({ fileName, typeName }) => {
  console.log("Generating schema for", fileName, typeName);

  const program = TJS.getProgramFromFiles([fileName], {}, ".");
  const schema = TJS.generateSchema(program, typeName, {});

  fs.writeFileSync(path.join(targetDir, typeName + ".json"), JSON.stringify(schema));
});
