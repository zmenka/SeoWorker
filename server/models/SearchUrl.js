function SearchUrl(isNeedDownloading, pageNumber, sengineName, url) {
    if (!isNeedDownloading && isNeedDownloading != false) { throw "SearchUrl.  isNeedDownloading can't be empty"; }
    if (!pageNumber && pageNumber != 0) { throw "SearchUrl.  pageNumber can't be empty"; }
    if (!sengineName) { throw "SearchUrl.  sengineName can't be empty"; }
    if (!url) { throw "SearchUrl.  url can't be empty"; }

    this.isNeedDownloading = isNeedDownloading;
    this.pageNumber = pageNumber;
    this.sengineName = sengineName;
    this.url = url;

}

/**
 * @param links:  {url: string, title: string}
 * @param spage_id
 */
SearchUrl.prototype.addLinks = function(links, spage_id){
    if (!links || !links.length) {throw new Error('SearchUrl.prototype.addLinks: no links')}
    if (!spage_id ) {throw new Error('SearchUrl.prototype.addLinks: no spage_id')}
    this.links = links
    this.spage_id = spage_id
}

SearchUrl.prototype.getLinksLength = function(){
    if (!this.links || !this.links.length) {throw new Error('SearchUrl.prototype.getLinksLength: no links')}
    return this.links.length
}

SearchUrl.prototype.getStart = function(){
    if (!this.start && this.start != 0 ) {throw new Error('SearchUrl.prototype.getStart: no start')}
    return this.start
}

SearchUrl.prototype.setStart = function(start){
    this.start = start
}

module.exports = SearchUrl;