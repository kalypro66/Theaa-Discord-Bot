function startTyping(
    channel,
    intervalMs = 8000
)
{
    let active =
        true;

    const sendTyping = () =>
    {
        if (
            !active ||
            typeof channel?.sendTyping !==
                "function"
        )
        {
            return;
        }

        channel.sendTyping()
            .catch(() => {});
    };

    sendTyping();

    const interval =
        setInterval(
            sendTyping,
            intervalMs
        );

    interval.unref?.();

    return () =>
    {
        if (!active)
            return;

        active =
            false;

        clearInterval(
            interval
        );
    };
}

module.exports = {
    startTyping
};
