var _super = require("./TreeNode.js").prototype,
    method = TaskTreeNode.prototype = Object.create( _super );

method.constructor = TaskTreeNode;

function TaskTreeNode() {
    _super.constructor.apply( this );
    this.type = "";
}
//Pointless override to show super calls
//note that for performance (e.g. inlining the below is impossible)
//you should do
//method.$getAge = _super.getAge;
//and then use this.$getAge() instead of super()
method.create = function(title, collapsed, data, type) {
    _super.create.call(this, title, collapsed, data);
    this.type = type;
};

module.exports = TaskTreeNode;