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
(0, globals_1.describe)("POST /api/user/signin", () => {
    //1.successful signin
    (0, globals_1.it)("should signin an existing user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.success).toBe(true);
        (0, globals_1.expect)(res.body.message).toBe("Login successful.");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
    }));
    // 2. fail if mobile not sent
    (0, globals_1.it)('should fail if mobile number is not sent', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin");
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //3. fail if user not found
    (0, globals_1.it)('should fail if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "8888888888" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
        (0, globals_1.expect)(res.body.message).toBe("User not registered.");
        (0, globals_1.expect)(prismaMock.user.findUnique).toHaveBeenCalled();
    }));
    // 4. invalid mobile formats
    (0, globals_1.it)("should fail if mobile number is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post("/api/user/signin").send({ mobile: "12345" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    // 5. invalid mobile type
    (0, globals_1.it)("should fail if mobile number format is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post("/api/user/signin").send({ mobile: "abcd" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    // 6. prisma read error
    (0, globals_1.it)("should fail if prisma.user.findUnique throws DB read error", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockRejectedValue(new Error("DB read failure"));
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  7. Unexpected runtime error in handler
    (0, globals_1.it)("should handle unexpected runtime errors gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.jest.spyOn(console, "error").mockImplementation(() => { });
        prismaMock.user.findUnique.mockImplementation(() => {
            throw new Error("Unexpected runtime issue");
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  8. Invalid JSON body
    (0, globals_1.it)("should fail when request body is not valid JSON", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .set("Content-Type", "text/plain")
            .send("invalid-body");
        (0, globals_1.expect)(res.status).toBeGreaterThanOrEqual(400);
    }));
    // 9.slow DB simulation
    (0, globals_1.it)("should simulate as low Prisma DB call and take >5s", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockImplementation(() => {
            return new Promise((resolve) => setTimeout(() => resolve({
                userId: "slow-123",
                username: "nithin",
                mobile: "9999999999",
                token: null,
                role: "USER",
                createdAt: new Date(),
                updatedAt: new Date(),
            }), 5000));
        });
        const start = Date.now();
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        const duration = Date.now() - start;
        (0, globals_1.expect)(duration).toBeGreaterThanOrEqual(5000);
        (0, globals_1.expect)([200, 408, 500]).toContain(res.status);
    }), 10000);
    // 10. prisma connection failure
    (0, globals_1.it)("should fail when prisma connection fails", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockImplementation(() => {
            throw new Error("Prisma connection lost");
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
    }));
    (0, globals_1.it)("should handle when Prisma throws a non-Error type (likestring or object)", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockImplementation(() => {
            // @ts-ignoresimulate Prisma throwingsomething invalid
            throw "database is corrupted"; // not an Error instance
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signin")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
});
