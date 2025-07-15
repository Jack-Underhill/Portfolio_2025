// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
import { Redis } from "@upstash/redis"

import { shouldSkipIP } from "./utils/shouldSkipIP";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async (request, context) => {
  try {
    const ip = request.headers.get("x-nf-client-connection-ip") || "unknown";
    console.log("Visitor IP:", ip);

    if(shouldSkipIP(ip)) {
      console.log(`Skipping site view IP from tracking: ${ip}`);
      const count = await redis.get("unique_visits");
      return new Response(JSON.stringify({ count: count ?? 0, counted: false }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const alreadyVisited = await redis.get(`visited:${ip}`);
    if(!alreadyVisited) {
      await redis.incr("unique_visits");
      await redis.set(`visited:${ip}`, "true", { ex: 60 * 60 * 24 });
    }

    const count = await redis.get("unique_visits");

    return new Response(JSON.stringify({ count }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return new Response(error.toString(), { status: 500 });
  }
};