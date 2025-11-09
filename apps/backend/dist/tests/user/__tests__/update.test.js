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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const secret = process.env.JWT_SECRET;
const token = jsonwebtoken_1.default.sign({ user: { userId: "123", role: "USER" } }, secret, { expiresIn: '1h' });
(0, globals_1.describe)("PUT /api/user/update", () => {
    //1. should pass for valid token
    (0, globals_1.it)("should pass with a valid token", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.user.update.mockResolvedValue({
            userId: "123",
            username: "arjun",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "arjun" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.success).toBe(true);
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.user.update).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail for missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .send({ username: "arjun" });
        (0, globals_1.expect)(res.status).toBe(401);
        (0, globals_1.expect)(res.body.message).toBe("Unauthorized");
    }));
    (0, globals_1.it)("should fail for invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer invalidtoken`)
            .send({ username: "arjun" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.message).toBe("Invalid or expired token");
    }));
    (0, globals_1.it)("should fail for non existing user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "arjun" });
        (0, globals_1.expect)(res.status).toBe(401);
        (0, globals_1.expect)(res.body.message).toBe("Unauthorized");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail for role mismatch", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "arjun" });
        (0, globals_1.expect)(res.status).toBe(403);
        (0, globals_1.expect)(res.body.message).toBe("Forbidden");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: {
                userId: "123",
            },
            select: {
                userId: true,
                role: true,
            }
        });
    }));
    (0, globals_1.it)("should fail for empty username", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: "" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    (0, globals_1.it)("should fail for invalid username", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`)
            .send({ username: 12345 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    (0, globals_1.it)("should fail for no username", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).put("/api/user/update")
            .set("Authorization", `Bearer ${token}`);
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
});
