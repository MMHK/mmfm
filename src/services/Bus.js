import Vue from "vue";

if (!global.bus) {
    global.bus = new Vue();
}

let EventBus = global.bus;

export {
    EventBus
}