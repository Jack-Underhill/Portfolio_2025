import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

export default async (request, context) => {
    try {
        const url = new URL(request.url);
        const repo = url.searchParams.get("repo"); 

        if(!repo) {
            return new Response(`Missing 'repo' query parameter`, { 
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const cacheKey = `github:traffic:${repo}`;

        // Check cache first
        const cached = await redis.get(cacheKey);
        if(cached) {
            return new Response(JSON.stringify(cached), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // If not cached, then fetch from GitHub
        const githubResponse = await fetch(`https://api.github.com/repos/${repo}/traffic/views`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            }
        });

        if(!githubResponse.ok) {
            return new Response(JSON.stringify({ error: `Github Error: ${githubResponse.statusText}` }), { 
                status: githubResponse.status, 
                headers: { "Content-Type": "application/json" },
            });
        }

        const data = await githubResponse.json();
        const json = JSON.stringify(data);

        await redis.set(cacheKey, json, { ex: CACHE_TTL_SECONDS });

        return new Response(json, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(`Function Error: ${error.toString()}`, { status: 500 });
    }
};