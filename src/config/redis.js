const {createClient} = require("redis");

const subscriber = createClient({
    url: "redis://localhost:6379"
});









(async () => {
    await subscriber.connect();
    console.log("redis connected");
    await subscriber.subscribe("notification", (message) => {
        console.log(message);
    })


})();


