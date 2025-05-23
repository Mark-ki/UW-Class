export const classList = [
    { name: "CS200" },
    { name: "CS300", req: ["CS200"] },
    { name: "CS400", req: ["CS300"] },
    { name: "Math354", req: ["CS400"] },
    { name: "CS500", req: ["Math354", "CS400"] },
    { name: "CS600" },
    { name: "Math101" },
    { name: "Physics201", req: ["Math101"] },
    { name: "Chemistry301", req: ["Physics201"] },
    { name: "Biology401", req: ["Chemistry301"] },
    { name: "CS700", req: ["CS500"] },
    { name: "Math201", req: ["Math101"] },
    { name: "Physics301", req: ["Physics201", "Math201"] },
    { name: "Chemistry401", req: ["Chemistry301", "Physics301"] },
    { name: "Biology501", req: ["Biology401", "Chemistry401"] },
    { name: "CS800", req: ["CS700", "Math354"] },
    { name: "Math102", req: ["Math101"] },
    { name: "Physics101" },
    { name: "Astronomy201", req: ["Physics101", "Math102"] },
    { name: "Geology301", req: ["Physics101"] },
    { name: "CS900", req: ["CS800"] },
    { name: "Math401", req: ["Math201"] },
    { name: "Physics401", req: ["Physics301", "Math401"] },
    { name: "Chemistry501", req: ["Chemistry401", "Physics401"] },
    { name: "Biology601", req: ["Biology501", "Chemistry501"] },
    { name: "CS1000", req: ["CS900", "Math401"] },
    { name: "Math202", req: ["Math102"] },
    { name: "Physics202", req: ["Physics101", "Math202"] },
    { name: "Astronomy301", req: ["Astronomy201", "Physics202"] },
    { name: "Geology401", req: ["Geology301", "Physics202"] },
    { name: "CS1100", req: ["CS1000", "Math202"] },
    { name: "Math501", req: ["Math401"] },
    { name: "Physics501", req: ["Physics401", "Math501"] },
    { name: "Chemistry601", req: ["Chemistry501", "Physics501"] },
    { name: "Biology701", req: ["Biology601", "Chemistry601"] },
    { name: "CS1200", req: ["CS1100", "Math501"] },
    { name: "Math301", req: ["Math202"] },
    { name: "Physics601", req: ["Physics501", "Math301"] },
    { name: "Astronomy401", req: ["Astronomy301", "Physics601"] },
    { name: "Geology501", req: ["Geology401", "Physics601"] },
];