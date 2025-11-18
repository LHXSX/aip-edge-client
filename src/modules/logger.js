// 日志系统模块
export class LogManager {
    constructor() {
        this.logs = [];
    }
    log(level, msg) {
        this.logs.push({level, msg, time: new Date()});
    }
}
