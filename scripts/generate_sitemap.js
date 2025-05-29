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

const sitemapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ">
    <url>
        <loc>https://${host}/</loc>
        <lastmod>${currentDate}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://${host}/connect</loc>
        <lastmod>${currentDate}</lastmod>
        <priority>0.7</priority>
    </url>
</urlset>`;

const sitemapPath = "./public/sitemap.xml";

fs.writeFile(sitemapPath, sitemapTemplate, (err) => {
  if (err) {
    console.error("Error writing sitemap file:", err);
    process.exit(1);
  }
  console.log("Sitemap updated successfully with current date:", currentDate);
});
