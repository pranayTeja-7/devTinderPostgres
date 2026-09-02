const {createClient} = require("redis");

const publisher = createClient({
    url: "redis://localhost:6379",
});

(async function(){
    await publisher.connect();
    await publisher.publish("notification", "hello world 1");
    await publisher.quit();
})();