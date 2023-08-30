const fs = require("fs");
const path = require("path");

const folderPath = "data";


const mergeJsonFiles = () => {
  const mergedArray = [];

  try {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      const data = fs.readFileSync(filePath, "utf8");
      const jsonArray = JSON.parse(data);

      mergedArray.push(...jsonArray);
    });

    return mergedArray;
  } catch (err) {
    console.error("Error merging JSON files:", err);
    return null;
  }
};


module.exports = mergeJsonFiles;