#!/usr/bin/env bun

import fs from "fs";

const currentDate = new Date().toISOString().split("T")[0];

const sitemapTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ">
    <url>
        <loc>https://geoff.seemueller.io/</loc>
        <lastmod>${currentDate}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://geoff.seemueller.io/connect</loc>
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
