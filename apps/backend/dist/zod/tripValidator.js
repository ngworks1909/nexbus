"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTripSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTripSchema = zod_1.default.object({
    sourceId: zod_1.default.string({ message: "source city id is required" }),
    destinationId: zod_1.default.string({ message: "destination city id is required" }),
    targetPrice: zod_1.default.number().min(1, { message: "target price should be at least 1" }),
    travelDate: zod_1.default.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.default.date({ message: "Travel date must be a valid date" }))
});
