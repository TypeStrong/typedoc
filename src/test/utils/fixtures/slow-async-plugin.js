module.exports = {
    async load(app) {
        await new Promise((resolve) => {
            setTimeout(() => resolve(), 500);
        });

        app.convert();
    },
};
