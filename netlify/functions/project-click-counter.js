import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async (request, context) => {
    try {
        const url = new URL(request.url);
        const projectEncoded = url.searchParams.get("project"); 
        const project = Buffer.from(projectEncoded, "base64").toString("utf-8"); 
        const ip = request.headers.get("x-nf-client-connection-ip") || "unknown";

        if(!project) {
            return new Response(JSON.stringify({error: `Missing 'repo' query parameter`}), { 
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const ipKey = `clicked:${project}:${ip}`;
        const clickKey = `clicks:${project}`;

        let counted = false;

        const alreadyVisited = await redis.get(ipKey);
        if(!alreadyVisited) {
            await redis.incr(clickKey);
            await redis.set(ipKey, "true", { ex: 60 * 60 * 24 });
            counted = true;
        }

        const total = await redis.get(clickKey);

        return new Response(JSON.stringify({ project, count: total ?? 0, counted }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        })
    } catch (error) {
        return new Response(`Function Error: ${error.toString()}`, { status: 500 });
    }
};