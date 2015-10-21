
function SearchUrlWithLinks(url, links, pageNumber, isNeedDownloading ) {
    if (!links || !links.length) {throw new Error('no links')}
    if (!pageNumber && pageNumber != 0 ) {throw new Error('no pageNumber')}
    if (!url ) {throw new Error('no url')}
//{url: string, title: string, id: number, params:{}[]}
    this.links = links
    this.pageNumber = pageNumber
    this.isNeedDownloading = !!isNeedDownloading;
    this.startLinksNumber = 0;
}

module.exports = SearchUrlWithLinks;