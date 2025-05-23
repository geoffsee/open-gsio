(async () => {
  // Run the script with bun so it automatically picks up the env
  const apiKey = process.env.GROQ_API_KEY;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
