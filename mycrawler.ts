import { PlaywrightCrawler } from "crawlee";
import fs from "fs";

const results = []; // Store all titles & descriptions

const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
        await page.waitForSelector(".MuiCard-root");

        // Extract titles & descriptions
        const data = await page.$$eval(".MuiCard-root", (cards) => {
            return cards.map((card) => {
                return {
                    title: card.querySelector("div div div:nth-child(2)")?.textContent.trim() || "No title",
                    description: card.querySelector(".DescriptionExcerpt")?.textContent.trim() || "No description",
                };
            });
        });

        // Log titles and store results
        for (const item of data) {
            console.log(`Title: ${item.title}`); // Log to console
            results.push(item); // Store in results array
        }
    },
});

// Run the crawler and save data after it's done
await crawler.run(["https://orgcentral.psu.edu/organizations"]);

// Write all results to a single JSON file
fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
console.log("Data saved to results.json");
