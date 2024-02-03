const knex = require("../database/db");

exports.createOrder = async (params) => {
    const { userId, cart } = params;

    if (!cart) throw { message: "cart was not provided", statusCode: 400 };
    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    try {
        const [newOrderId] = await knex("orders").insert({ user_id: userId });

        await Promise.all(
            cart.products.map(async (prod) => {
                const [product] = await knex("products")
                    .select("quantity")
                    .where({ id: prod.id });

                let productQuantity = product.quantity;
                let updatedQuantity = productQuantity - prod.quantity;
                productQuantity = updatedQuantity > 0 ? updatedQuantity : 0;

                await knex("orders_details").insert({
                    order_id: newOrderId,
                    product_id: prod.id,
                    quantity: prod.quantity,
                });

                await knex("products")
                    .where({ id: prod.id })
                    .update({ quantity: productQuantity });
            })
        );

        return {
            message: `Order was successfully placed with order id ${newOrderId}`,
            orderId: newOrderId,
            products: cart.products,
            statusCode: 201,
        };
    } catch (error) {
        throw {
            message: "New order failed while adding order details",
            statusCode: 500,
            data: error,
        };
    }
};

exports.getSingleOrder = async (params) => {
    const { orderId, userId } = params;

    if (!orderId)
        throw { message: "orderId was not provided", statusCode: 400 };
    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    try {
        const result = await knex("orders")
            .select("*")
            .innerJoin(
                "orders_details",
                "orders.id",
                "=",
                "orders_details.order_id"
            )
            .where({ "orders.id": orderId, "orders.user_id": userId });

        if (result.length === 0) {
            throw { message: "order was not found", statusCode: 400 };
        }

        return { statusCode: 200, message: `Order was found`, data: result };
    } catch (error) {
        throw { message: error, statusCode: 500 };
    }
};

exports.getOrders = async (params) => {
    const { userId } = params;

    if (!userId) throw { message: "userId was not provided", statusCode: 400 };

    try {
        const result = await knex("orders")
            .select("*")
            .innerJoin(
                "orders_details",
                "orders.id",
                "=",
                "orders_details.order_id"
            )
            .where({ user_id: userId })
            .orderBy("orders.id", "desc");

        console.log(result);
        if (result.length === 0) {
            throw { message: "No orders were found", statusCode: 400 };
        }

        return {
            statusCode: 200,
            message: `${result.length} orders were found`,
            data: result,
        };
    } catch (error) {
        throw { message: error, statusCode: 500 };
    }
};
