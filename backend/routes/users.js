const express = require("express");
const router = express.Router();
const knex = require("../database/db");
const userController = require("../controllers/userController");

// Get all users
router.get("/", async (req, res) => {
    try {
        const users = await knex.select("*").from("users");
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/:userId", userController.update_user);

module.exports = router;
