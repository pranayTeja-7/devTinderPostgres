const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(
    "dev_tinder_postgres",
    "postgres",
    "Postgres@123",
    {
        host: "localhost",
        dialect: "postgres"
    }
);


const sequelize_test_function = async () => {
    try{
        await sequelize.authenticate();
        console.log("connected to db")
    }
    catch(err){
        console.log(err)
    }
}

sequelize_test_function();

module.exports = {sequelize};