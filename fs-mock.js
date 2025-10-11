module.exports = {
  readFileSync: () => {
    throw new Error("fs.readFileSync is not supported in React Native");
  },
  writeFileSync: () => {
    throw new Error("fs.writeFileSync is not supported in React Native");
  },
  // Add other fs methods as needed
};
