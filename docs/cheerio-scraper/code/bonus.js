async function pageFunction(context) {
    switch (context.request.userData.label) {
        case 'START': return handleStart(context);
        case 'DETAIL': return handleDetail(context);
    }

    async function handleStart({ log, waitFor, $ }) {
        log.info('Store opened!');

        const dataJson = $('#__NEXT_DATA__').text();
        const data = JSON.parse(dataJson);

        for (const item of data.props.pageProps.items) {
            const { name, username } = item;
            const actorDetailUrl = `https://apify.com/${username}/${name}`;
            await context.enqueueRequest({
                url: actorDetailUrl,
                userData: {
                    label: 'DETAIL',
                }
            });
        }
    }

    async function handleDetail({ request, log, skipLinks, $ }) {
        const { url } = request;
        log.info(`Scraping ${url}`);
        await skipLinks();

        // Do some scraping.
        const uniqueIdentifier = url.split('/').slice(-2).join('/');

        return {
            url,
            uniqueIdentifier,
            title: $('header h1').text(),
            description: $('header p[class^=Text__Paragraph]').text(),
            lastRunDate: new Date(
                Number(
                    $('time')
                        .eq(1)
                        .attr('datetime'),
                ),
            ),
            runCount: Number(
                $('ul.stats li:nth-of-type(3)')
                    .text()
                    .match(/\d+/)[0],
            ),
        };
    }
}
