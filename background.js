const button = {
    active: false,
    status: null,
};

const buttonActive = {
    [true]: 'blue',
    [false]: 'grey',
};

const buttonStatus = {
    hit: 'green',
    miss: 'red',
};

const isVarnishPresent = ({ headers = [] } = {}) =>
    headers.some(({ name }) => ['x-varnish', 'x-cache'].includes(name));

const varnishStatus = ({ headers = [] } = {}) => {
    const varnishHeaders = headers.filter(({ name }) => name === 'x-cache');
    console.log('varnishHeadesr');
    console.log(varnishHeaders);
    if (varnishHeaders.length) {
        return varnishHeaders.some((header) => {
            console.log(header.value);
            return header.value.includes('hit');
        })
            ? 'hit'
            : 'miss';
    }

    return null;
};

chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (details.type === 'main_frame') {
            const headers = details.responseHeaders;
            button.active = isVarnishPresent({ headers });
            button.status = varnishStatus({ headers });
        }
    },
    {
        urls: ['http://*/*', 'https://*/*'],
    },
    ['responseHeaders'],
);

chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) {
        chrome.pageAction.setIcon({
            path: `img/${
                (button.status && buttonStatus[button.status]) ||
                buttonActive[button.active]
            }.png`,
            tabId: details.tabId,
        });
    }
});
