const PPLS = {
    commands: {},

    register(name, func) {
        this.commands[name] = func;
    },

    run(line) {
        line = line.trim();

        if (!line.startsWith("PPLS:")) {
            return;
        }

        line = line.substring(5).trim();

        const match = line.match(/^([a-zA-Z0-9_]+)\[(.*)\]$/);

        if (!match) {
            console.error("PPLS Error: Invalid command");
            return;
        }

        const command = match[1];
        const value = match[2];

        if (this.commands[command]) {
            this.commands[command](value);
        } else {
            console.error("PPLS Error: Unknown command " + command);
        }
    },

    runScript(script) {
        const lines = script.split("\n");

        lines.forEach(line => {
            this.run(line);
        });
    }
};


PPLS.register("shellprint_pt", function(text) {
    console.log(text);
});


PPLS.register("top", function(text) {
    console.log(text);
});


PPLS.register("mathop", function(expression) {
    try {
        const result = Function("return " + expression)();
        console.log(result);
    } catch (error) {
        console.error("PPLS Math Error");
    }
});
