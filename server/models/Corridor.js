function Corridor(paramtype_name, m, d) {
    if (!paramtype_name) { throw new Error("  paramtype_name can't be empty"); }
    if (!m && m!=0) { throw new Error("  m can't be empty"); }
    if (!d && d!=0) { throw new Error("  d can't be empty"); }

    this.paramtype_name = paramtype_name;
    this.m = m;
    this.d = d;
}

module.exports = Corridor;