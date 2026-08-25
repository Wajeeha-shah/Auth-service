import { calculateDiscount } from "./src/utils/utils";
import app from "./src/app";
import request from "supertest"
describe.skip("App", () => {
    it("should return correct discount", () => {
        const discount = calculateDiscount(100, 20);
        expect(discount).toBe(20);
    })
    it("should return 200 status code", async () => {
        const res = await request(app)
            .get("/")
            .send()
        expect(res.status).toBe(200);
    })
})