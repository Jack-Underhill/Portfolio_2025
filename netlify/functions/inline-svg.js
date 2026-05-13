const ALLOWED_PATH_PREFIX = "/storage/v1/object/public/portfolio-assets/project-architecture/";

function validateSvgUrl(rawUrl) {
    if (!rawUrl) return null;

    try {
        const url = new URL(rawUrl);
        const isSupabaseStorage = url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
        const isProjectArchitectureSvg =
            url.pathname.startsWith(ALLOWED_PATH_PREFIX) &&
            url.pathname.toLowerCase().endsWith(".svg");

        if (!isSupabaseStorage || !isProjectArchitectureSvg) return null;
        return url;
    } catch {
        return null;
    }
}

export default async (request) => {
    try {
        const requestUrl = new URL(request.url);
        const targetUrl = validateSvgUrl(requestUrl.searchParams.get("url"));

        if (!targetUrl) {
            return new Response("Invalid SVG URL", { status: 400 });
        }

        const upstream = await fetch(targetUrl, {
            headers: {
                Accept: "image/svg+xml,image/*;q=0.8,*/*;q=0.1",
            },
        });

        if (!upstream.ok) {
            return new Response("SVG not found", { status: upstream.status });
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                "Content-Type": "image/svg+xml; charset=utf-8",
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
                "Content-Security-Policy": "default-src 'none'; img-src https: data: blob:; style-src 'unsafe-inline'; sandbox",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        return new Response(`Function Error: ${error.toString()}`, { status: 500 });
    }
};
