const ws = new WebSocket(`wss://${location.host}`);
ws.onmessage = (event) => {
    if (event.data === "reload") {
        console.log("File change detected. Reloading...");
        window.location.reload();
    }
};
