"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const jest_mock_extended_1 = require("jest-mock-extended");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../../index");
const client_1 = require("../../../lib/client");
globals_1.jest.mock("../../../lib/client");
const prismaMock = client_1.prisma;
(0, globals_1.beforeEach)(() => {
    (0, jest_mock_extended_1.mockReset)(prismaMock);
    globals_1.jest.clearAllMocks();
});
(0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof client_1.prisma.$disconnect === "function") {
        yield client_1.prisma.$disconnect();
    }
}));
(0, globals_1.describe)("GET /api/city/searchcities", () => {
    //1. Successful city search
    (0, globals_1.it)("should fetch city successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.city.findMany.mockResolvedValue([{
                cityId: "city123",
                name: "Metropolis",
                code: "134",
                createdAt: new Date(),
                updatedAt: new Date(),
            }]);
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/city/searchcities")
            .query({ name: "Metro" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.cities.length).toBe(1);
        (0, globals_1.expect)(prismaMock.city.findMany).toHaveBeenCalled();
    }));
    //2. should fetch all cities if name is empty
    (0, globals_1.it)("should fetch all cities if name is empty", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.city.findMany.mockResolvedValue([{
                cityId: "city123",
                name: "Metropolis",
                code: "134",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                cityId: "city124",
                name: "Gotham",
                code: "135",
                createdAt: new Date(),
                updatedAt: new Date(),
            }]);
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/city/searchcities").query({ name: "" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.cities.length).toBe(2);
        (0, globals_1.expect)(prismaMock.city.findMany).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should handle server errors", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.city.findMany.mockRejectedValue(new Error("DB error"));
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/city/searchcities")
            .query({ name: "Metro" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.message).toBe("Internal server error");
    }));
    (0, globals_1.it)("should handle missing query parameter", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/city/searchcities");
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("Invalid data");
        (0, globals_1.expect)(prismaMock.city.findMany).not.toHaveBeenCalled();
    }));
});
