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
const token = jsonwebtoken_1.default.sign({ user: { userId: "123" } }, secret, { expiresIn: '1h' });
(0, globals_1.describe)("POST /api/trip/create", () => {
    //1. successful trip creation
    (0, globals_1.it)("should create a new trip and alert", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.trip.findUnique.mockResolvedValue(null);
        prismaMock.$transaction.mockImplementation(() => {
            prismaMock.trip.create.mockResolvedValue({
                tripId: "trip123",
                sourceId: "city123",
                destinationId: "city124",
                travelDate: new Date("2025-12-25"),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            prismaMock.alert.create.mockResolvedValue({
                alertId: "alert123",
                userId: "123",
                tripId: "trip123",
                targetPrice: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
                notified: false
            });
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(prismaMock.$transaction).toHaveBeenCalled();
        (0, globals_1.expect)(res.body.message).toBe("Trip and alert created successfully");
    }));
    //2. should create alert for existing trip
    (0, globals_1.it)("should create alert for existing trip", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.trip.findUnique.mockResolvedValue({
            tripId: "trip123",
            sourceId: "city123",
            destinationId: "city124",
            travelDate: new Date("2025-12-25"),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.alert.findUnique.mockResolvedValue(null);
        prismaMock.alert.create.mockResolvedValue({
            alertId: "alert123",
            userId: "123",
            tripId: "trip123",
            targetPrice: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            notified: false
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.message).toBe("Alert created successfully");
        (0, globals_1.expect)(prismaMock.alert.create).toHaveBeenCalled();
    }));
    (0, globals_1.it)("should fail if alert already exists for the trip", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prismaMock.trip.findUnique.mockResolvedValue({
            tripId: "trip123",
            sourceId: "city123",
            destinationId: "city124",
            travelDate: new Date("2025-12-25"),
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
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("Alert already exists for this trip");
    }));
    (0, globals_1.it)("should fail for missing fields", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("destination city id is required");
    }));
    (0, globals_1.it)("should fail for past travel date", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "user1",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2020-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.message).toBe("Travel date should be in the future");
    }));
    (0, globals_1.it)("should fail for invalid user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(401);
        (0, globals_1.expect)(res.body.message).toBe("Unauthorized");
    }));
    (0, globals_1.it)("should fail for non-user role", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "admin123",
            username: "admin",
            mobile: "9999999999",
            token: null,
            role: "ADMIN",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/trip/create")
            .set("Authorization", `Bearer ${token}`)
            .send({ sourceId: "city123", destinationId: "city124", travelDate: "2025-12-25", targetPrice: 100 });
        (0, globals_1.expect)(res.status).toBe(403);
        (0, globals_1.expect)(res.body.message).toBe("Forbidden");
    }));
});
