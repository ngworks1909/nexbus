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
(0, globals_1.describe)("GET /api/trip/fetchalerts", () => {
    //1. successful fetch of alerts
    (0, globals_1.it)("should fetch all alerts for the user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.alert.findMany.mockResolvedValue([
            {
                alertId: "alert123",
                userId: "123",
                tripId: "trip123",
                targetPrice: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
                notified: false
            },
            {
                alertId: "alert124",
                userId: "123",
                tripId: "trip124",
                targetPrice: 150,
                createdAt: new Date(),
                updatedAt: new Date(),
                notified: true
            }
        ]);
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/trip/fetchalerts")
            .set("Authorization", `Bearer ${token}`);
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.alerts).toHaveLength(2);
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
        (0, globals_1.expect)(prismaMock.alert.findMany).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail for missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/trip/fetchalerts");
        (0, globals_1.expect)(res.status).toBe(401);
        (0, globals_1.expect)(res.body.message).toBe("Unauthorized");
    }));
    (0, globals_1.it)("should fail for invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .get("/api/trip/fetchalerts")
            .set("Authorization", `Bearer invalidtoken`);
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.message).toBe("Invalid or expired token");
    }));
});
