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
const express_1 = require("express");
const cityValidator_1 = require("../zod/cityValidator");
const client_1 = require("../lib/client");
const auth_1 = require("../middleware/auth");
const zod_1 = __importDefault(require("zod"));
const router = (0, express_1.Router)();
//city 124 Hyderabad
router.post("/create", (0, auth_1.verifyAuth)("ADMIN"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatCityValidationResponse = cityValidator_1.createCitySchema.safeParse(req.body);
    if (!creatCityValidationResponse.success) {
        return res.status(400).json({ message: creatCityValidationResponse.error.issues[0].message });
    }
    const { name, code } = creatCityValidationResponse.data;
    try {
        const existsingCity = yield client_1.prisma.city.findUnique({
            where: {
                name_code: {
                    name,
                    code
                }
            }
        });
        if (existsingCity) {
            return res.status(400).json({ message: "City with same name and code already exists" });
        }
        yield client_1.prisma.city.create({
            data: {
                name, code
            }
        });
        return res.status(200).json({ message: "City created successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
router.get("/searchcities", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchCityResponse = zod_1.default.string().safeParse(req.query.name);
        if (!searchCityResponse.success) {
            return res.status(400).json({ message: 'Invalid data' });
        }
        const name = searchCityResponse.data;
        if (!name) {
            const cities = yield client_1.prisma.city.findMany({
                select: {
                    cityId: true,
                    name: true,
                },
                take: 4
            });
            return res.status(200).json({ cities });
        }
        const cities = yield client_1.prisma.city.findMany({
            where: {
                name: {
                    contains: name,
                    mode: "insensitive"
                },
            },
            select: {
                cityId: true,
                name: true,
            },
            take: 10
        });
        return res.status(200).json({ cities });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
