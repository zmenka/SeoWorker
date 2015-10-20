function Corridor(paramTypeName, m, d) {
    if (!paramTypeName) { throw new Error("  paramTypeName can't be empty"); }
    if (!m && m!=0) { throw new Error("  m can't be empty"); }
    if (!d && d!=0) { throw new Error("  d can't be empty"); }

    this.paramTypeName = paramTypeName;
    this.m = m;
    this.d = d;
}

module.exports = Corridor;