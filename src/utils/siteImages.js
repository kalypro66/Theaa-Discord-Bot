const dns =
    require("node:dns/promises");

const net =
    require("node:net");

function isPrivateIpv4(address)
{
    const parts =
        address
            .split(".")
            .map(Number);

    if (
        parts.length !== 4 ||
        parts.some(part =>
            !Number.isInteger(part) ||
            part < 0 ||
            part > 255
        )
    )
    {
        return true;
    }

    const [first, second] =
        parts;

    return (
        first === 0 ||
        first === 10 ||
        first === 127 ||
        (first === 100 && second >= 64 && second <= 127) ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        first >= 224
    );
}

function isPrivateIp(address)
{
    const normalized =
        String(address || "")
            .toLowerCase();

    const version =
        net.isIP(normalized);

    if (version === 4)
        return isPrivateIpv4(normalized);

    if (version !== 6)
        return true;

    return (
        normalized === "::1" ||
        normalized === "::" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe8") ||
        normalized.startsWith("fe9") ||
        normalized.startsWith("fea") ||
        normalized.startsWith("feb") ||
        normalized.startsWith("::ffff:127.") ||
        normalized.startsWith("::ffff:10.") ||
        normalized.startsWith("::ffff:192.168.")
    );
}

async function validatePublicUrl(value)
{
    let url;

    try
    {
        url =
            new URL(value);
    }
    catch
    {
        throw new Error(
            "That doesn't look like a valid URL."
        );
    }

    if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
    )
    {
        throw new Error(
            "Only HTTP and HTTPS website links are allowed."
        );
    }

    const hostname =
        url.hostname
            .toLowerCase();

    if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname.endsWith(".local") ||
        hostname.endsWith(".internal")
    )
    {
        throw new Error(
            "Local or private-network links are not allowed."
        );
    }

    if (
        net.isIP(hostname) &&
        isPrivateIp(hostname)
    )
    {
        throw new Error(
            "Local or private-network links are not allowed."
        );
    }

    const addresses =
        await dns.lookup(
            hostname,
            {
                all:
                    true,
                verbatim:
                    true
            }
        );

    if (
        !addresses.length ||
        addresses.some(entry =>
            isPrivateIp(
                entry.address
            )
        )
    )
    {
        throw new Error(
            "That website resolves to a private or unsafe address."
        );
    }

    return url;
}

function normalizeUrl(
    value,
    baseUrl
)
{
    if (!value)
        return null;

    const cleaned =
        String(value)
            .trim()
            .replace(/^['"]|['"]$/g, "");

    if (
        !cleaned ||
        cleaned.startsWith("data:") ||
        cleaned.startsWith("javascript:")
    )
    {
        return null;
    }

    try
    {
        const url =
            new URL(
                cleaned,
                baseUrl
            );

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        )
        {
            return null;
        }

        return url.href;
    }
    catch
    {
        return null;
    }
}

function extractMetaImages(html, pageUrl)
{
    const matches = [];
    const regex = /<meta[^>]+(?:property|name)=['"](?:og:image|twitter:image)['"][^>]+content=['"]([^'"]+)['"][^>]*>/gi;
    let match;

    while ((match = regex.exec(html)))
    {
        const url =
            normalizeUrl(
                match[1],
                pageUrl
            );

        if (url)
        {
            matches.push({
                url,
                alt:
                    "",
                source:
                    "meta"
            });
        }
    }

    return matches;
}

function extractImgTags(html, pageUrl)
{
    const results = [];
    const imgRegex = /<img\b[^>]*>/gi;
    let tag;

    while ((tag = imgRegex.exec(html)))
    {
        const htmlTag =
            tag[0];

        const srcMatch =
            htmlTag.match(/(?:src|data-src|data-lazy-src)=['"]([^'"]+)['"]/i);

        if (!srcMatch)
            continue;

        const altMatch =
            htmlTag.match(/alt=['"]([^'"]*)['"]/i);

        const url =
            normalizeUrl(
                srcMatch[1],
                pageUrl
            );

        if (!url)
            continue;

        results.push({
            url,
            alt:
                altMatch?.[1] || "",
            source:
                "img"
        });
    }

    return results;
}

function uniqueImages(images)
{
    const seen =
        new Set();

    return images.filter(image =>
    {
        const key =
            image.url;

        if (!key || seen.has(key))
            return false;

        seen.add(key);
        return true;
    });
}

function scoreImage(image, query)
{
    let score = 0;

    if (image.source === "meta")
        score += 50;

    if (!query)
        return score;

    const haystack =
        `${image.alt} ${image.url}`
            .toLowerCase();

    const words =
        String(query)
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

    for (const word of words)
    {
        if (haystack.includes(word))
            score += 15;
    }

    return score;
}

async function fetchPageHtml(initialUrl)
{
    let current =
        await validatePublicUrl(
            initialUrl
        );

    for (let redirectCount = 0; redirectCount <= 4; redirectCount += 1)
    {
        const response =
            await fetch(
                current,
                {
                    redirect:
                        "manual",
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 TheaaBot/1.0"
                    }
                }
            );

        if (
            response.status >= 300 &&
            response.status < 400
        )
        {
            const location =
                response.headers.get(
                    "location"
                );

            if (!location)
            {
                throw new Error(
                    "The website returned an invalid redirect."
                );
            }

            current =
                await validatePublicUrl(
                    new URL(
                        location,
                        current
                    ).href
                );

            continue;
        }

        if (!response.ok)
        {
            throw new Error(
                `Website request failed with status ${response.status}.`
            );
        }

        const contentLength =
            Number(
                response.headers.get(
                    "content-length"
                ) || 0
            );

        if (contentLength > 2_000_000)
        {
            throw new Error(
                "That webpage is too large to inspect safely."
            );
        }

        const html =
            (await response.text())
                .slice(0, 2_000_000);

        return {
            html,
            pageUrl:
                current.href
        };
    }

    throw new Error(
        "The website redirected too many times."
    );
}

async function fetchSiteImages(
    pageUrl,
    {
        query = "",
        limit = 4
    } = {}
)
{
    const page =
        await fetchPageHtml(
            pageUrl
        );

    return uniqueImages([
        ...extractMetaImages(
            page.html,
            page.pageUrl
        ),
        ...extractImgTags(
            page.html,
            page.pageUrl
        )
    ])
        .sort(
            (first, second) =>
                scoreImage(second, query) -
                scoreImage(first, query)
        )
        .slice(
            0,
            Math.max(
                1,
                Math.min(limit, 5)
            )
        );
}

module.exports = {
    isPrivateIp,
    validatePublicUrl,
    fetchSiteImages
};
