const MAX_IMAGE_BYTES =
    8 * 1024 * 1024;

function isImageLike(attachment)
{
    if (!attachment)
        return false;

    const contentType =
        String(attachment.contentType || "")
            .toLowerCase();

    if (contentType.startsWith("image/"))
        return true;

    const name =
        String(
            attachment.name ||
            attachment.url ||
            ""
        ).toLowerCase();

    return /\.(png|jpe?g|webp|gif)($|\?)/i.test(
        name
    );
}

function getImageAttachments(
    message,
    limit = 4
)
{
    if (!message?.attachments)
        return [];

    return [
        ...message.attachments.values()
    ]
        .filter(
            isImageLike
        )
        .slice(
            0,
            limit
        )
        .map(attachment => ({
            id:
                attachment.id,

            name:
                attachment.name ||
                "image",

            contentType:
                attachment.contentType ||
                null,

            url:
                attachment.proxyURL ||
                attachment.url,

            size:
                attachment.size ||
                0
        }))
        .filter(image =>
            image.url
        );
}

async function fetchImageBuffer(
    image,
    {
        maxBytes =
            MAX_IMAGE_BYTES,

        timeoutMs =
            20000
    } = {}
)
{
    if (!image?.url)
    {
        throw new Error(
            "Image URL is missing."
        );
    }

    if (
        Number(image.size) >
        maxBytes
    )
    {
        throw new Error(
            "That image is too large to analyze."
        );
    }

    const controller =
        new AbortController();

    const timer =
        setTimeout(
            () =>
                controller.abort(),
            timeoutMs
        );

    try
    {
        const response =
            await fetch(
                image.url,
                {
                    signal:
                        controller.signal,

                    headers: {
                        "User-Agent":
                            "Theaa-Discord-Bot/1.0"
                    }
                }
            );

        if (!response.ok)
        {
            throw new Error(
                `Image download failed with status ${response.status}.`
            );
        }

        const contentLength =
            Number(
                response.headers.get(
                    "content-length"
                ) ||
                0
            );

        if (
            contentLength >
            maxBytes
        )
        {
            throw new Error(
                "That image is too large to analyze."
            );
        }

        const contentType =
            String(
                response.headers.get(
                    "content-type"
                ) ||
                image.contentType ||
                "image/jpeg"
            )
                .split(";")[0]
                .trim()
                .toLowerCase();

        if (
            !contentType.startsWith(
                "image/"
            )
        )
        {
            throw new Error(
                "The attachment did not return image data."
            );
        }

        const buffer =
            Buffer.from(
                await response.arrayBuffer()
            );

        if (
            !buffer.length ||
            buffer.length >
                maxBytes
        )
        {
            throw new Error(
                "That image could not be processed safely."
            );
        }

        return {
            buffer,
            contentType,
            dataUrl:
                `data:${contentType};base64,${buffer.toString("base64")}`
        };
    }
    finally
    {
        clearTimeout(
            timer
        );
    }
}

async function prepareImagesForVision(
    images,
    limit = 4
)
{
    const prepared = [];

    for (
        const image of
        (images || []).slice(
            0,
            limit
        )
    )
    {
        try
        {
            prepared.push({
                ...image,
                ...await fetchImageBuffer(
                    image
                )
            });
        }
        catch (error)
        {
            console.error(
                "[Vision] Failed to prepare image:",
                error.message
            );
        }
    }

    return prepared;
}

module.exports = {
    MAX_IMAGE_BYTES,
    isImageLike,
    getImageAttachments,
    fetchImageBuffer,
    prepareImagesForVision
};
