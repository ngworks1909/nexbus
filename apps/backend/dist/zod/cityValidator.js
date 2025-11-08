"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCitySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCitySchema = zod_1.default.object({
    name: zod_1.default.string().min(2).max(100, { message: "City name should be at least 2 characters" }),
    code: zod_1.default.string().min(2).max(10, { message: "City code should be at least 2 characters" }),
});
