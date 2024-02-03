const express = require("express");
const router = express.Router();
const knex = require("../database/db");

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const startValue = page > 0 ? (page - 1) * limit : 0;

        const products = await knex("products as p")
            .select(
                "p.id",
                "p.title",
                "p.image",
                "p.price",
                "p.short_desc",
                "p.quantity",
                "c.title as category"
            )
            .join("categories as c", "c.id", "=", "p.cat_id")
            .limit(limit)
            .orderBy("p.id")
            .offset(startValue);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET SINGLE PRODUCT BY ID
router.get("/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await knex("products as p")
            .select(
                "p.id",
                "p.title",
                "p.image",
                "p.images",
                "p.description",
                "p.price",
                "p.quantity",
                "p.short_desc",
                "c.title as category"
            )
            .join("categories as c", "c.id", "=", "p.cat_id")
            .where("p.id", productId)
            .first();

        if (!product) {
            res.status(404).json({ message: "Product not found" });
        } else {
            res.json(product);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
