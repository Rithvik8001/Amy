// Test Rate Limiting - Run this in browser console
// This will make 26 requests quickly to test rate limiting

async function testRateLimit() {
  const testText = "I pay $15.99 monthly for Netflix";
  let successCount = 0;
  let rateLimited = false;

  for (let i = 1; i <= 26; i++) {
    try {
      const response = await fetch("/api/ai/parse-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: `${testText} - Request ${i}` }),
      });

      const data = await response.json();

      if (response.status === 429) {
        console.log(`✅ Request ${i}: Rate limited!`, data);
        rateLimited = true;
        console.log(`Rate limit headers:`, {
          limit: response.headers.get("X-RateLimit-Limit"),
          remaining: response.headers.get("X-RateLimit-Remaining"),
          reset: response.headers.get("X-RateLimit-Reset"),
        });
        break;
      } else if (response.ok) {
        successCount++;
        console.log(`✅ Request ${i}: Success (${successCount}/25)`);
        console.log(`Rate limit headers:`, {
          limit: response.headers.get("X-RateLimit-Limit"),
          remaining: response.headers.get("X-RateLimit-Remaining"),
          reset: response.headers.get("X-RateLimit-Reset"),
        });
      } else {
        console.log(`❌ Request ${i}: Error`, data);
      }

      // Small delay to avoid overwhelming
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Request ${i}: Exception`, error);
    }
  }

  if (rateLimited) {
    console.log(`\n✅ Rate limiting works! Blocked after ${successCount} requests`);
  } else {
    console.log(`\n⚠️ Rate limit not triggered (made ${successCount} requests)`);
  }
}

// Run the test
testRateLimit();

