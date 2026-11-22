"use strict";

import("./daily-update.mjs").catch((error) => {
  console.error("Unable to load daily funding update:", error);
  process.exitCode = 1;
});
