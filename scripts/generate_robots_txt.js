#!/usr/bin/env bun

import fs from "fs";
import {parseArgs} from "util";


const {positionals} = parseArgs({
  args: Bun.argv,
  options: {},
  strict: true,
  allowPositionals: true,
});

const currentDate = new Date().toISOString().split("T")[0];

const host = positionals[2];

const robotsTxtTemplate = `
User-agent: *
Allow: /
Allow: /connect
Disallow: /api
Disallow: /assets

Sitemap: https://${host}/sitemap.xml
`;

const robotsTxtPath = "./public/robots.txt";

fs.writeFile(robotsTxtPath, robotsTxtTemplate, (err) => {
  if (err) {
    console.error("Error writing robots.txt:", err);
    process.exit(1);
  }
  console.log("robots.txt created successfully:", currentDate);
});
