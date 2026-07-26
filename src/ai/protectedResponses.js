const {
    DEVELOPER_NAME,
    isDeveloper
} = require(
    "../config/developer"
);

function normalize(text)
{
    return String(text || "")
        .toLowerCase()
        .replace(/[?!.,:;"'`]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function asksAboutDeveloper(text)
{
    const normalized =
        normalize(text);

    return [
        /\bwho (made|created|developed|built) you\b/,
        /\bwho is your (developer|creator|maker)\b/,
        /\bdid i (make|create|develop|build) you\b/,
        /\bam i your (developer|creator|maker)\b/,
        /\b(tumhe|tujhe|aapko) kisne banaya\b/,
        /\b(tumhara|tera|aapka) developer kaun( hai)?\b/,
        /\b(kya )?maine (tumhe|tujhe|aapko) banaya\b/,
        /किसने बनाया/u,
        /डेवलपर कौन/u,
        /تمہیں کس نے بنایا/u,
        /تمہارا ڈویلپر کون/u
    ].some(pattern =>
        pattern.test(normalized)
    );
}

function detectLanguage(text)
{
    const value =
        String(text || "");

    if (/[\u0900-\u097F]/u.test(value))
        return "hindi";

    if (/[\u0600-\u06FF]/u.test(value))
        return "urdu";

    if (
        /\b(tum|tumhe|tujhe|tera|tumhara|aap|aapko|kisne|kaun|maine|banaya)\b/i
            .test(value)
    )
    {
        return "roman-urdu";
    }

    return "english";
}

function developerReply(context)
{
    const authorIsDeveloper =
        isDeveloper(
            context.userId
        );

    const language =
        detectLanguage(
            context.message
        );

    if (language === "hindi")
    {
        return authorIsDeveloper
            ? "हाँ, आपने मुझे बनाया है। आप ही मेरे डेवलपर हैं।"
            : `${DEVELOPER_NAME} मेरे डेवलपर हैं।`;
    }

    if (language === "urdu")
    {
        return authorIsDeveloper
            ? "ہاں، آپ نے مجھے بنایا ہے۔ آپ ہی میرے ڈویلپر ہیں۔"
            : `${DEVELOPER_NAME} میرے ڈویلپر ہیں۔`;
    }

    if (language === "roman-urdu")
    {
        return authorIsDeveloper
            ? "Haan, tumne mujhe banaya hai. Tum hi mere developer ho."
            : `${DEVELOPER_NAME} mere developer hain.`;
    }

    return authorIsDeveloper
        ? "Yeah. You made me—you’re my developer."
        : `${DEVELOPER_NAME} is my developer.`;
}

function getProtectedResponse(context)
{
    if (
        asksAboutDeveloper(
            context.message
        )
    )
    {
        return developerReply(
            context
        );
    }

    return null;
}

module.exports = {
    getProtectedResponse,
    asksAboutDeveloper,
    detectLanguage
};
