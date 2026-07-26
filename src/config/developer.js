const DEFAULT_DEVELOPER_ID =
    "770202235741011989";

const DEFAULT_DEVELOPER_NAME =
    "Abdul";

const DEVELOPER_ID =
    String(
        process.env.THEAA_DEVELOPER_ID ||
        DEFAULT_DEVELOPER_ID
    ).trim();

const DEVELOPER_NAME =
    String(
        process.env.THEAA_DEVELOPER_NAME ||
        DEFAULT_DEVELOPER_NAME
    ).trim();

function isDeveloper(userId)
{
    return (
        Boolean(userId) &&
        String(userId) ===
            DEVELOPER_ID
    );
}

module.exports = {
    DEVELOPER_ID,
    DEVELOPER_NAME,
    isDeveloper
};
