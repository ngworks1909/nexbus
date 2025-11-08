"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
// import './cron/cron'
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./routes/user"));
const city_1 = __importDefault(require("./routes/city"));
const trip_1 = __importDefault(require("./routes/trip"));
exports.app = (0, express_1.default)();
dotenv_1.default.config();
exports.app.use(express_1.default.json());
exports.app.use("/api/user", user_1.default);
exports.app.use("/api/city", city_1.default);
exports.app.use("/api/trip", trip_1.default);
