const TOKEN = "";
const ACCOUNT_ID = "";

async function showTables() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`;

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "SHOW TABLES",
  };

  try {
    console.log("Sending request to Cloudflare Analytics Engine...");
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response received:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

showTables();
