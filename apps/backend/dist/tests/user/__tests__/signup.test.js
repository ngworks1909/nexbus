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
const library_1 = require("@prisma/client/runtime/library");
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
(0, globals_1.describe)("POST /api/user/signup", () => {
    // 1.successful signup
    (0, globals_1.it)("should create a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
            userId: "123",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.success).toBe(true);
        (0, globals_1.expect)(res.body.message).toBe("Signup successful.");
        (0, globals_1.expect)(prismaMock.user.create).toHaveBeenCalled();
    }));
    //  2. Missing username
    (0, globals_1.it)("should fail when username is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  3. Missing mobile
    (0, globals_1.it)("should fail when mobile number is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  4. Invalid mobile format
    (0, globals_1.it)("should fail when mobile number format is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "abcd" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  5. Empty username and mobile
    (0, globals_1.it)("should fail when username and mobile are empty", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "", mobile: "" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  6. Invalid mobile length
    (0, globals_1.it)("should fail when mobile number length is not 10 digits", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "70141156" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  7. Username too short
    (0, globals_1.it)("should fail when username is tooshort", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "a", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  9. User already exists
    (0, globals_1.it)("should fail when user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue({
            userId: "existing",
            username: "nithin",
            mobile: "9999999999",
            token: null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(400);
        (0, globals_1.expect)(res.body.success).toBe(false);
        (0, globals_1.expect)(res.body.message).toBe("User already exists.");
    }));
    //  10. Database error during findUnique
    (0, globals_1.it)("should fail if prisma.user.findUnique throws DB read error", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockRejectedValue(new Error("DB read failure"));
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  11. Database error during create
    (0, globals_1.it)("should fail if prisma.user.create throws DB insert error", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockRejectedValue(new Error("DB insert failure"));
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  12. Unique constraint violation during create (Prisma P2002)
    (0, globals_1.it)("should fail if Prisma unique constraint (P2002) is triggered", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        const prismaError = new library_1.PrismaClientKnownRequestError("Unique constraint failed on the field: `mobile`", { code: "P2002", clientVersion: "5.13.0" });
        prismaMock.user.create.mockRejectedValue(prismaError);
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(400);
    }));
    //  13. Unexpected runtime error in handler
    (0, globals_1.it)("should handle unexpected runtime errors gracefully", () => __awaiter(void 0, void 0, void 0, function* () {
        globals_1.jest.spyOn(console, "error").mockImplementation(() => { });
        prismaMock.user.findUnique.mockImplementation(() => {
            throw new Error("Unexpected runtime issue");
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
    //  14. Invalid JSON body
    (0, globals_1.it)("should fail when request body is not valid JSON", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .set("Content-Type", "text/plain")
            .send("invalid-body");
        (0, globals_1.expect)(res.status).toBeGreaterThanOrEqual(400);
    }));
    // 15.slow DB simulation
    (0, globals_1.it)("should simulate as low Prisma DB call and take >5s", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockImplementation(() => {
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
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        const duration = Date.now() - start;
        (0, globals_1.expect)(duration).toBeGreaterThanOrEqual(5000);
        (0, globals_1.expect)([200, 408, 500]).toContain(res.status);
    }), 10000);
    //  16. Prisma connection failure
    (0, globals_1.it)("should fail when prisma connection fails", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockImplementation(() => {
            throw new Error("Prisma connection lost");
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
    }));
    //  17. Null body
    (0, globals_1.it)("should fail if body is completely missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).post("/api/user/signup").send();
        (0, globals_1.expect)(res.status).toBe(400);
    }));
    //  18. Non-string username type
    (0, globals_1.it)("should fail if username is not a string", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: 12345, mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(400);
    }));
    //  19. Non-string mobile type
    (0, globals_1.it)("should fail if mobile is not a string", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: 9999999999 });
        (0, globals_1.expect)(res.status).toBe(400);
    }));
    //  17. Prisma method throws non-Error type
    (0, globals_1.it)("should handle when Prisma throws a non-Error type (likestring or object)", () => __awaiter(void 0, void 0, void 0, function* () {
        prismaMock.user.findUnique.mockImplementation(() => {
            // @ts-ignoresimulate Prisma throwingsomething invalid
            throw "database is corrupted"; // not an Error instance
        });
        const res = yield (0, supertest_1.default)(index_1.app)
            .post("/api/user/signup")
            .send({ username: "nithin", mobile: "9999999999" });
        (0, globals_1.expect)(res.status).toBe(500);
        (0, globals_1.expect)(res.body.success).toBe(false);
    }));
});
