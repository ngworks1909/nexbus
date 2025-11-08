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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const secret = process.env.JWT_SECRET;
const token = jsonwebtoken_1.default.sign({ user: { userId: "123" } }, secret, { expiresIn: '1h' });
(0, globals_1.describe)("POST /api/city/create", () => {
    //1. successful city creation
    (0, globals_1.it)("should create a new city", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "admin",
            mobile: "9999999999",
            token: null,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.city.findUnique.mockResolvedValue(null);
        prismaMock.city.create.mockResolvedValue({
            cityId: "city123",
            name: "Metropolis",
            code: "134",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/city/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Metropolis", code: "134" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.message).toBe("City created successfully");
        (0, globals_1.expect)(prismaMock.city.create).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should faile if city already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "admin",
            mobile: "9999999999",
            token: null,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.city.findUnique.mockResolvedValue({
            cityId: "city123",
            name: "Metropolis",
            code: "134",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/city/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Metropolis", code: "134" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("City with same name and code already exists");
    }));
    (0, globals_1.it)("should fail for non-admin user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/city/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Metropolis", code: "134" });
        (0, globals_1.expect)(res.status).toBe(403);
        (0, globals_1.expect)(res.body.message).toBe("Forbidden");
    }));
});
