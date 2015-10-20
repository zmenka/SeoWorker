function SearchUrl(isNeedDownloading, pageNumber, sengineName, url) {
    if (!isNeedDownloading && isNeedDownloading != false) { throw new Error("  isNeedDownloading can't be empty"); }
    if (!pageNumber && pageNumber != 0) { throw new Error("  pageNumber can't be empty"); }
    if (!sengineName) { throw new Error("  sengineName can't be empty"); }
    if (!url) { throw new Error("  url can't be empty"); }

    this.isNeedDownloading = isNeedDownloading;
    this.pageNumber = pageNumber;
    this.sengineName = sengineName;
    this.url = url;

}

module.exports = SearchUrl;