type RegionTagRETuple = [
    (regionName: string) => RegExp,
    (regionName: string) => RegExp,
];
const regionTagREsByExt: Record<string, RegionTagRETuple[]> = {
    bat: [
        [
            (regionName) => new RegExp(`:: *#region  *${regionName}`, "g"),
            (regionName) => new RegExp(`:: *#endregion  *${regionName}`, "g"),
        ],
        [
            (regionName) => new RegExp(`REM  *#region  *${regionName}`, "g"),
            (regionName) => new RegExp(`REM  *#endregion  *${regionName}`, "g"),
        ],
    ],
    cs: [
        [
            (regionName) => new RegExp(`#region  *${regionName}`, "g"),
            (regionName) => new RegExp(`#endregion  *${regionName}`, "g"),
        ],
    ],
    c: [
        [
            (regionName) => new RegExp(`#pragma  *region  *${regionName}`, "g"),
            (regionName) =>
                new RegExp(`#pragma  *endregion  *${regionName}`, "g"),
        ],
    ],
    css: [
        [
            (regionName) =>
                new RegExp(`/\\* *#region *\\*/  *${regionName}`, "g"),
            (regionName) =>
                new RegExp(`/\\* *#endregion *\\*/  *${regionName}`, "g"),
        ],
    ],
    md: [
        [
            (regionName) =>
                new RegExp(`<!--  *#region  *-->  *${regionName}`, "g"),
            (regionName) =>
                new RegExp(`<!--  *#endregion  *-->  *${regionName}`, "g"),
        ],
    ],
    ts: [
        [
            (regionName) => new RegExp(`// *#region  *${regionName}`, "g"),
            (regionName) => new RegExp(`// *#endregion  *${regionName}`, "g"),
        ],
    ],
    vb: [
        [
            (regionName) => new RegExp(`#Region  *${regionName}`, "g"),
            (regionName) => new RegExp(`#End Region  *${regionName}`, "g"),
        ],
    ],
};
regionTagREsByExt["fs"] = regionTagREsByExt["ts"].concat([
    (regionName) => new RegExp(`(#_region)  *${regionName}`, "g"),
    (regionName) => new RegExp(`(#_endregion)  *${regionName}`, "g"),
]);
regionTagREsByExt["java"] = regionTagREsByExt["ts"].concat([
    (regionName) => new RegExp(`// *<editor-fold>  *${regionName}`, "g"),
    (regionName) => new RegExp(`// *</editor-fold>  *${regionName}`, "g"),
]);
regionTagREsByExt["cpp"] = regionTagREsByExt["c"];
regionTagREsByExt["less"] = regionTagREsByExt["css"];
regionTagREsByExt["scss"] = regionTagREsByExt["css"];
regionTagREsByExt["coffee"] = regionTagREsByExt["cs"];
regionTagREsByExt["php"] = regionTagREsByExt["cs"];
regionTagREsByExt["ps1"] = regionTagREsByExt["cs"];
regionTagREsByExt["py"] = regionTagREsByExt["cs"];
regionTagREsByExt["js"] = regionTagREsByExt["ts"];

export default regionTagREsByExt;
