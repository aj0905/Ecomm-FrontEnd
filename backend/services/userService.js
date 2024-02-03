const { updateUserValidation } = require("../middleware/validation");
const knex = require("../database/db");
const md5 = require("md5");

exports.updateUser = async (params) => {
    const { error } = updateUserValidation(params);
    if (error) throw { message: error.details[0].message, statusCode: 400 };

    const { userId, fullName, email, password } = params;
    const hashedPassword = md5(password.toString());

    try {
        const result = await knex("users")
            .select("*")
            .where({ id: userId, password: hashedPassword });

        if (result.length === 0) {
            throw {
                message: "Wrong credentials, please try again",
                statusCode: 400,
            };
        }

        let updateFields = {};

        if (email !== result[0].email) {
            updateFields.email = email;
        }

        if (fullName !== result[0].fname) {
            updateFields.fname = fullName;
        }

        if (email !== result[0].email || fullName !== result[0].fname) {
            await knex("users").where({ id: userId }).update(updateFields);
        } else {
            throw "No new data has been provided";
            // {
            //     message: "No new data has been provided",
            //     statusCode: 400,
            // };
        }

        return {
            message: "User details have been successfully updated",
            data: result,
        };
    } catch (error) {
        throw { message: error, statusCode: 500 };
    }
};
