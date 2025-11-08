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
const token = jsonwebtoken_1.default.sign({ user: { userId: "123", role: "USER" } }, secret, { expiresIn: '1h' });
(0, globals_1.describe)("PATCH /api/trip/update/:alertId", () => {
    //1. should pass for valid token and valid alertId
    (0, globals_1.it)("should pass with a valid token and valid alertId", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.alert.findUnique.mockResolvedValue({
            alertId: "alert123",
            userId: "123",
            tripId: "trip123",
            targetPrice: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            notified: false
        });
        prismaMock.alert.update.mockResolvedValue({
            alertId: "alert123",
            userId: "123",
            tripId: "trip123",
            targetPrice: 80,
            createdAt: new Date(),
            updatedAt: new Date(),
            notified: false
        });
        const res = yield (0, supertest_1.default)(index_1.app).patch("/api/trip/update/alert123")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetPrice: 80 });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.alert.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.alert.update).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail for missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).patch("/api/trip/update/alert123")
            .send({ targetPrice: 80 });
        (0, globals_1.expect)(res.status).toBe(401);
        (0, globals_1.expect)(res.body.message).toBe("Unauthorized");
    }));
    (0, globals_1.it)("should fail if alert id not passed", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app).patch("/api/trip/update/''")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetPrice: 80 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("Alert not found");
    }));
    (0, globals_1.it)("should fail for non existing alert", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.alert.findUnique.mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(index_1.app).patch("/api/trip/update/alert123")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetPrice: 80 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("Alert not found");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.alert.findUnique).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail for alert not belonging to user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.alert.findUnique.mockResolvedValue({
            alertId: "alert123",
            userId: "456",
            tripId: "trip123",
            targetPrice: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            notified: false
        });
        const res = yield (0, supertest_1.default)(index_1.app).patch("/api/trip/update/alert123")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetPrice: 80 });
        (0, globals_1.expect)(res.status).toBe(403);
        (0, globals_1.expect)(res.body.message).toBe("Forbidden");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.alert.findUnique).toHaveBeenCalled();
    }));
});
