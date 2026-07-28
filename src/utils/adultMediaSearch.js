const MAX_MEDIA_BYTES =
    10 * 1024 * 1024;

const REQUEST_TIMEOUT_MS =
    15000;

const BLOCKED_QUERY = [
    /\b(?:minor|underage|child|kid|toddler|preteen|teen(?:ager)?|schoolgirl|schoolboy|student|loli|shota)\b/i,
    /\b(?:rape|raping|forced|non[-\s]?consensual|unconscious|drugged)\b/i,
    /\b(?:bestiality|zoophilia|animal sex|incest)\b/i,
    /\b(?:deepfake|celebrity nude|real person nude|leaked nude|revenge porn|hidden camera)\b/i
];

const BLOCKED_TAGS =
    new Set([
        "loli",
        "lolicon",
        "shota",
        "shotacon",
        "child",
        "underage",
        "young",
        "teenage",
        "school_uniform",
        "middle_school",
        "elementary_school",
        "kindergarten",
        "rape",
        "forced",
        "nonconsensual",
        "bestiality",
        "zoophilia",
        "incest"
    ]);

const ADULT_TERMS =
    /(?:\b(?:nsfw|adult|explicit|hentai|porn|nude|nudity|naked|sex|sexual|sexy|erotic|ecchi|lewd|horny|fetish|bdsm|boobs?|breasts?|ass|butt|cum|oral|anal|fellatio|blowjob|penetration|yuri|yaoi|rule ?34|r34)\b|18\+)/i;

const STATIC_EXTENSIONS =
    new Set([
        "jpg",
        "jpeg",
        "png",
        "webp"
    ]);

const ANIMATED_EXTENSIONS =
    new Set([
        "gif",
        "webm",
        "mp4"
    ]);

let waifuTagCache = {
    expiresAt:
        0,

    tags:
        new Map()
};

function normalizeQuery(value)
{
    return String(value || "")
        .replace(/[_-]+/g, " ")
        .replace(/[^\p{L}\p{N}\s']/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function validateAdultQuery(value)
{
    const query =
        normalizeQuery(value);

    if (!query)
    {
        return {
            ok:
                false,

            message:
                "Tell me what adult media to search for."
        };
    }

    if (
        BLOCKED_QUERY.some(pattern =>
            pattern.test(query)
        )
    )
    {
        return {
            ok:
                false,

            message:
                "Sorry, I can't search for that."
        };
    }

    return {
        ok:
            true,

        query:
            query.slice(0, 180)
    };
}

function isAdultQuery(value)
{
    return ADULT_TERMS.test(
        normalizeQuery(value)
    );
}

function getTags(value)
{
    return String(value || "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
}

function hasBlockedTags(value)
{
    return getTags(value)
        .some(tag =>
            BLOCKED_TAGS.has(tag)
        );
}

function toSearchTags(value)
{
    let query =
        normalizeQuery(value)
            .toLowerCase();

    const tags = [];

    const phrases = [
        [/(?:man|guy|male)\s+(?:and|with)\s+(?:woman|girl|female)/i, ["1boy", "1girl"]],
        [/(?:woman|girl|female)\s+(?:and|with)\s+(?:man|guy|male)/i, ["1girl", "1boy"]],
        [/two\s+(?:women|girls|females)/i, ["2girls"]],
        [/two\s+(?:men|guys|males)/i, ["2boys"]],
        [/big\s+(?:boobs|breasts)/i, ["large_breasts"]],
        [/small\s+(?:boobs|breasts)/i, ["small_breasts"]],
        [/cat\s*girl/i, ["cat_girl"]],
        [/bunny\s*girl/i, ["bunny_girl"]]
    ];

    for (const [pattern, mapped] of phrases)
    {
        if (pattern.test(query))
        {
            tags.push(...mapped);
            query = query.replace(pattern, " ");
        }
    }

    const map =
        new Map([
            ["woman", "1girl"],
            ["girl", "1girl"],
            ["female", "1girl"],
            ["man", "1boy"],
            ["guy", "1boy"],
            ["male", "1boy"],
            ["dancing", "dancing"],
            ["dance", "dancing"],
            ["maid", "maid"],
            ["nurse", "nurse"],
            ["teacher", "teacher"],
            ["catgirl", "cat_girl"],
            ["bunnygirl", "bunny_girl"],
            ["lesbian", "yuri"],
            ["yuri", "yuri"],
            ["gay", "yaoi"],
            ["yaoi", "yaoi"],
            ["boobs", "breasts"],
            ["breast", "breasts"],
            ["breasts", "breasts"],
            ["ass", "ass"],
            ["butt", "ass"],
            ["oral", "oral"],
            ["anal", "anal"],
            ["blowjob", "fellatio"],
            ["fellatio", "fellatio"],
            ["nude", "nude"],
            ["naked", "nude"],
            ["lingerie", "lingerie"],
            ["cosplay", "cosplay"]
        ]);

    const stop =
        new Set([
            "a",
            "an",
            "the",
            "and",
            "or",
            "with",
            "of",
            "in",
            "on",
            "at",
            "to",
            "for",
            "from",
            "me",
            "please",
            "send",
            "show",
            "find",
            "search",
            "image",
            "picture",
            "pic",
            "photo",
            "gif",
            "animated",
            "anime",
            "hentai",
            "nsfw",
            "adult",
            "explicit"
        ]);

    for (const token of query.split(/\s+/))
    {
        if (!token || stop.has(token))
            continue;

        const mapped =
            map.get(token) ||
            token.replace(/'+/g, "");

        if (/^[a-z0-9_]+$/.test(mapped))
            tags.push(mapped);
    }

    return [
        ...new Set(tags)
    ].slice(0, 6);
}

function extensionFrom(value)
{
    const clean =
        String(value || "")
            .split("?")[0]
            .split("#")[0];

    return clean.includes(".")
        ? clean.split(".")
            .pop()
            .toLowerCase()
        : "";
}

function createTimeout()
{
    const controller =
        new AbortController();

    const timer =
        setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT_MS
        );

    return {
        signal:
            controller.signal,

        clear: () =>
            clearTimeout(timer)
    };
}

async function fetchJson(url, headers = {})
{
    const timeout =
        createTimeout();

    try
    {
        const response =
            await fetch(
                url,
                {
                    signal:
                        timeout.signal,

                    redirect:
                        "error",

                    headers: {
                        Accept:
                            "application/json",

                        "User-Agent":
                            "Theaa-Discord-Bot/1.0",

                        ...headers
                    }
                }
            );

        if (!response.ok)
        {
            return {
                ok:
                    false,

                status:
                    response.status
            };
        }

        return {
            ok:
                true,

            data:
                await response.json()
        };
    }
    catch (error)
    {
        return {
            ok:
                false,

            timedOut:
                error?.name ===
                    "AbortError"
        };
    }
    finally
    {
        timeout.clear();
    }
}

async function downloadMedia(url, allowedHost)
{
    let parsed;

    try
    {
        parsed =
            new URL(url);
    }
    catch
    {
        throw new Error(
            "The media provider returned an invalid URL."
        );
    }

    if (
        parsed.protocol !==
            "https:" ||
        !allowedHost(
            parsed.hostname
        )
    )
    {
        throw new Error(
            "The media provider returned an unsafe URL."
        );
    }

    const timeout =
        createTimeout();

    try
    {
        const response =
            await fetch(
                parsed,
                {
                    signal:
                        timeout.signal,

                    redirect:
                        "error",

                    headers: {
                        "User-Agent":
                            "Theaa-Discord-Bot/1.0"
                    }
                }
            );

        if (!response.ok)
        {
            throw new Error(
                `Media download failed with status ${response.status}.`
            );
        }

        const declaredSize =
            Number(
                response.headers.get(
                    "content-length"
                ) ||
                0
            );

        if (
            declaredSize >
            MAX_MEDIA_BYTES
        )
        {
            throw new Error(
                "That media file is too large for Discord."
            );
        }

        const contentType =
            String(
                response.headers.get(
                    "content-type"
                ) ||
                "application/octet-stream"
            )
                .split(";")[0]
                .toLowerCase();

        if (
            !contentType.startsWith(
                "image/"
            ) &&
            !contentType.startsWith(
                "video/"
            )
        )
        {
            throw new Error(
                "The media provider returned a non-media response."
            );
        }

        const buffer =
            Buffer.from(
                await response.arrayBuffer()
            );

        if (
            !buffer.length ||
            buffer.length >
                MAX_MEDIA_BYTES
        )
        {
            throw new Error(
                "That media file is empty or too large for Discord."
            );
        }

        return {
            buffer,
            contentType
        };
    }
    finally
    {
        timeout.clear();
    }
}

function normalizeGelbooruPosts(data)
{
    if (Array.isArray(data))
        return data;

    if (Array.isArray(data?.post))
        return data.post;

    if (Array.isArray(data?.posts))
        return data.posts;

    return [];
}

function normalizeGelbooruUrl(value)
{
    const url =
        String(value || "")
            .trim();

    if (url.startsWith("//"))
        return `https:${url}`;

    if (url.startsWith("/"))
        return `https://gelbooru.com${url}`;

    return url;
}

async function searchGelbooru(query, animated)
{
    const apiKey =
        String(
            process.env.GELBOORU_API_KEY ||
            ""
        ).trim();

    const userId =
        String(
            process.env.GELBOORU_USER_ID ||
            ""
        ).trim();

    if (!apiKey || !userId)
    {
        return {
            ok:
                false,

            skipped:
                true,

            message:
                "Gelbooru is not configured."
        };
    }

    const tags = [
        ...toSearchTags(query),
        "rating:explicit",
        "-loli",
        "-shota",
        "-child",
        "-young",
        "-teenage",
        "-school_uniform",
        "-rape",
        "-forced"
    ];

    if (animated)
        tags.push("animated");

    const url =
        new URL(
            "https://gelbooru.com/index.php"
        );

    url.search =
        new URLSearchParams({
            page:
                "dapi",

            s:
                "post",

            q:
                "index",

            json:
                "1",

            limit:
                "100",

            tags:
                tags.join(" "),

            api_key:
                apiKey,

            user_id:
                userId
        }).toString();

    const response =
        await fetchJson(url);

    if (!response.ok)
    {
        return {
            ok:
                false,

            message:
                response.status === 401 ||
                response.status === 403 ||
                response.status === 429
                    ? "Gelbooru rejected or rate-limited the request."
                    : "Gelbooru could not be reached right now."
        };
    }

    const allowed =
        animated
            ? ANIMATED_EXTENSIONS
            : STATIC_EXTENSIONS;

    const candidates =
        normalizeGelbooruPosts(
            response.data
        ).filter(post =>
        {
            const mediaUrl =
                normalizeGelbooruUrl(
                    post?.file_url ||
                    post?.sample_url
                );

            const extension =
                String(
                    post?.file_ext ||
                    extensionFrom(mediaUrl)
                ).toLowerCase();

            const rating =
                String(
                    post?.rating ||
                    ""
                ).toLowerCase();

            const size =
                Number(
                    post?.file_size ||
                    0
                );

            return Boolean(
                mediaUrl &&
                allowed.has(extension) &&
                [
                    "e",
                    "explicit"
                ].includes(rating) &&
                !hasBlockedTags(
                    post?.tags
                ) &&
                (
                    !size ||
                    size <=
                        MAX_MEDIA_BYTES
                )
            );
        })
            .sort(() =>
                Math.random() - 0.5
            );

    for (const post of candidates.slice(0, 8))
    {
        const mediaUrl =
            normalizeGelbooruUrl(
                post?.file_url ||
                post?.sample_url
            );

        try
        {
            const downloaded =
                await downloadMedia(
                    mediaUrl,
                    hostname =>
                        hostname ===
                            "gelbooru.com" ||
                        hostname.endsWith(
                            ".gelbooru.com"
                        )
                );

            return {
                ok:
                    true,

                provider:
                    "Gelbooru",

                query,

                extension:
                    String(
                        post?.file_ext ||
                        extensionFrom(mediaUrl) ||
                        (animated ? "gif" : "jpg")
                    ).toLowerCase(),

                sourceUrl:
                    `https://gelbooru.com/index.php?page=post&s=view&id=${encodeURIComponent(post?.id || "")}`,

                ...downloaded
            };
        }
        catch
        {
            // Try another result.
        }
    }

    return {
        ok:
            false,

        message:
            "Gelbooru had no usable matching result."
    };
}

function waifuHeaders()
{
    const headers = {
        "Accept-Version":
            "v7"
    };

    const apiKey =
        String(
            process.env.WAIFU_IM_API_KEY ||
            ""
        ).trim();

    if (apiKey)
        headers["X-Api-Key"] = apiKey;

    return headers;
}

function normalizeWaifuTags(data)
{
    const values =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.tags)
                    ? data.tags
                    : [];

    const map =
        new Map();

    for (const tag of values)
    {
        const slug =
            String(
                tag?.slug ||
                tag?.name ||
                ""
            )
                .toLowerCase()
                .trim();

        if (!slug)
            continue;

        map.set(
            slug.replace(/\s+/g, "_"),
            slug
        );

        const name =
            String(
                tag?.name ||
                ""
            )
                .toLowerCase()
                .trim();

        if (name)
        {
            map.set(
                name.replace(/\s+/g, "_"),
                slug
            );
        }
    }

    return map;
}

async function getWaifuTags()
{
    if (
        waifuTagCache.expiresAt >
            Date.now() &&
        waifuTagCache.tags.size
    )
    {
        return waifuTagCache.tags;
    }

    const response =
        await fetchJson(
            "https://api.waifu.im/tags",
            waifuHeaders()
        );

    if (!response.ok)
        return new Map();

    const tags =
        normalizeWaifuTags(
            response.data
        );

    waifuTagCache = {
        expiresAt:
            Date.now() +
            30 * 60 * 1000,

        tags
    };

    return tags;
}

async function searchWaifu(query, animated)
{
    const available =
        await getWaifuTags();

    const matched = [];

    for (const candidate of [
        ...toSearchTags(query),
        "hentai"
    ])
    {
        const tag =
            available.get(
                String(candidate)
                    .toLowerCase()
                    .replace(/\s+/g, "_")
            );

        if (
            tag &&
            !matched.includes(tag)
        )
        {
            matched.push(tag);
        }
    }

    const url =
        new URL(
            "https://api.waifu.im/images"
        );

    url.searchParams.set(
        "IsNsfw",
        "True"
    );

    url.searchParams.set(
        "IsAnimated",
        animated
            ? "True"
            : "False"
    );

    url.searchParams.set(
        "OrderBy",
        "Random"
    );

    url.searchParams.set(
        "PageSize",
        "20"
    );

    url.searchParams.set(
        "ByteSize",
        `<=${MAX_MEDIA_BYTES}`
    );

    for (const tag of matched.slice(0, 3))
    {
        url.searchParams.append(
            "IncludedTags",
            tag
        );
    }

    const response =
        await fetchJson(
            url,
            waifuHeaders()
        );

    if (!response.ok)
    {
        return {
            ok:
                false,

            message:
                "Waifu.im could not be reached right now."
        };
    }

    const candidates =
        (
            Array.isArray(response.data?.items)
                ? response.data.items
                : []
        ).filter(item =>
        {
            const tags =
                Array.isArray(item?.tags)
                    ? item.tags
                        .map(tag =>
                            tag?.slug ||
                            tag?.name ||
                            ""
                        )
                        .join(" ")
                    : "";

            return Boolean(
                item?.isNsfw === true &&
                item?.isAnimated === animated &&
                !hasBlockedTags(tags) &&
                (
                    !Number(item?.byteSize) ||
                    Number(item.byteSize) <=
                        MAX_MEDIA_BYTES
                )
            );
        })
            .sort(() =>
                Math.random() - 0.5
            );

    for (const item of candidates.slice(0, 8))
    {
        try
        {
            const downloaded =
                await downloadMedia(
                    item.url,
                    hostname =>
                        hostname ===
                            "cdn.waifu.im" ||
                        hostname.endsWith(
                            ".waifu.im"
                        )
                );

            return {
                ok:
                    true,

                provider:
                    "Waifu.im",

                query,

                extension:
                    String(
                        item?.extension ||
                        extensionFrom(item?.url) ||
                        (animated ? "gif" : "jpg")
                    )
                        .replace(/^\./, "")
                        .toLowerCase(),

                sourceUrl:
                    item?.source ||
                    "https://www.waifu.im",

                ...downloaded
            };
        }
        catch
        {
            // Try another result.
        }
    }

    return {
        ok:
            false,

        message:
            animated
                ? "I couldn't find a usable matching adult GIF."
                : "I couldn't find a usable matching adult image."
    };
}

async function searchAdultMedia(
    value,
    {
        animated =
            false
    } = {}
)
{
    const validation =
        validateAdultQuery(
            value
        );

    if (!validation.ok)
        return validation;

    const gelbooru =
        await searchGelbooru(
            validation.query,
            animated
        );

    if (gelbooru.ok)
        return gelbooru;

    const waifu =
        await searchWaifu(
            validation.query,
            animated
        );

    if (waifu.ok)
        return waifu;

    return {
        ok:
            false,

        message:
            waifu.message ||
            gelbooru.message ||
            "I couldn't find a matching result."
    };
}

function clearWaifuTagCache()
{
    waifuTagCache = {
        expiresAt:
            0,

        tags:
            new Map()
    };
}

module.exports = {
    MAX_MEDIA_BYTES,
    validateAdultQuery,
    isAdultQuery,
    hasBlockedTags,
    toSearchTags,
    extensionFrom,
    normalizeGelbooruPosts,
    normalizeGelbooruUrl,
    normalizeWaifuTags,
    searchGelbooru,
    searchWaifu,
    searchAdultMedia,
    clearWaifuTagCache
};
