function TreeNode() {
    this.title = "";
    this.collapsed = false;
    this.data = {};
    this.nodes = [];
}

TreeNode.prototype.create = function(title, collapsed, data) {
    this.title = title;
    this.collapsed = collapsed;
    this.data = data;
};


TreeNode.prototype.createFromJson = function(json) {
    if (json) {
        for (var key in json) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            } else {
                console.log('TreeNode.prototype.createFromJson ',
                        this.constructor["name"] + " does not have field '" + key )
            }
        }
    }
};

module.exports = TreeNode;