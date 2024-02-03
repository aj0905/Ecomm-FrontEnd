const {
    loginValidation,
    registerValidation,
} = require("../middleware/validation");
const knex = require("../database/db");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

exports.loginUser = async (params) => {
    const { error } = loginValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    const { email, password } = params;
    const hashPassword = md5(password.toString());

    try {
        const result = await knex
            .select("*")
            .from("users")
            .where({ email, password: hashPassword });

        if (result.length === 0) {
            throw {
                message: "Wrong credentials, please try again",
                statusCode: 400,
            };
        }

        const token = jwt.sign({ data: result }, "secret");
        return {
            message: "Logged in successfully",
            data: result,
            token,
        };
    } catch (err) {
        throw {
            data: err,
            message: "Something went wrong, please try again",
            statusCode: 400,
        };
    }
};

exports.registerUser = async (params) => {
    const { error } = registerValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    const { fullName, email, password } = params;
    const hashPassword = md5(password.toString());

    try {
        const existingUser = await knex
            .select("email")
            .from("users")
            .where({ email });

        if (existingUser.length > 0) {
            throw {
                message: "Email address is in use, please try a different one",
                statusCode: 400,
            };
        }

        const [userId] = await knex("users").insert({
            fname: fullName,
            email,
            password: hashPassword,
            userName: fullName,
        });

        const token = jwt.sign({ data: userId }, "secret");
        return {
            data: { id: userId, fname: fullName, email },
            message: "You have successfully registered.",
            token,
            statusCode: 200,
        };
    } catch (err) {
        throw {
            message: "Something went wrong, please try again",
            statusCode: 400,
            data: err,
        };
    }
};
