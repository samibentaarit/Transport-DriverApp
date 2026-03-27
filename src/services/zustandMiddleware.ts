import type * as ZustandMiddleware from "zustand/middleware";

const middleware = require("zustand/middleware.js") as typeof ZustandMiddleware;

export const createJSONStorage = middleware.createJSONStorage;
export const persist = middleware.persist;
