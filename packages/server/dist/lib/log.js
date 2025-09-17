import fs from "fs";
export default (message) => {
    const d = new Date();
    const dateString = d.getUTCFullYear() +
        "-" +
        ("0" + (d.getUTCMonth() + 1)).slice(-2) +
        "-" +
        ("0" + d.getUTCDate()).slice(-2) +
        " " +
        ("0" + d.getUTCHours()).slice(-2) +
        ":" +
        ("0" + d.getUTCMinutes()).slice(-2) +
        ":" +
        ("0" + d.getUTCSeconds()).slice(-2);
    let dir = new URL("../../logs", import.meta.url).pathname;
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    dir =
        dir +
            "/" +
            d.getUTCFullYear() +
            "-" +
            ("0" + (d.getUTCMonth() + 1)).slice(-2) +
            "-" +
            ("0" + d.getUTCDate()).slice(-2);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    if (typeof message === "object") {
        const errorStr = JSON.stringify(message, [
            "message",
            "arguments",
            "type",
            "name",
            "stack",
        ]);
        const errStack = JSON.parse(errorStr).stack
            ? "\n" + "Error Stack:\n" + JSON.parse(errorStr).stack
            : "";
        const errMessage = JSON.parse(errorStr).message
            ? "\n" + "Error Message: " + JSON.parse(errorStr).message
            : "";
        const errArguments = JSON.parse(errorStr).arguments
            ? "\n" + "Error Arguments: " + JSON.parse(errorStr).arguments
            : "";
        const errType = JSON.parse(errorStr).type
            ? "\n" + "Error Type: " + JSON.parse(errorStr).type
            : "";
        const errName = JSON.parse(errorStr).name
            ? "\n" + "Error Name: " + JSON.parse(errorStr).name
            : "";
        const msg = "---------------------------------------\n" +
            dateString +
            errName +
            errMessage +
            errType +
            errArguments +
            errStack +
            "\n" +
            "---------------------------------------\n";
        fs.appendFile(dir + "/errors.log", msg, function (err) {
            if (err)
                return console.error(err);
        });
    }
    if (typeof message === "string") {
        const msg = dateString + " -- " + message + "\n";
        fs.appendFile(dir + "/info.log", msg, function (err) {
            if (err)
                return console.error(err);
        });
    }
};
//# sourceMappingURL=log.js.map