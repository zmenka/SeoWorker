
function QueryList () {
    this.list = []
};

QueryList.prototype.push = function(query, params, preResultContainer) {
    this.list.push({
        queryText: query,
        valuesArray: params || [],
        preResultContainer: preResultContainer || {}
    });
};
QueryList.prototype.add = function(otherQueryList) {
    this.list = this.list.concat(otherQueryList.list);
};
module.exports = QueryList;