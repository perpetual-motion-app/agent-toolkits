"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseToolkit = void 0;
class BaseToolkit {
    constructor() {
        this.tools = new Map();
    }
    /**
     * Register a new tool in the toolkit
     * @param tool The tool to register
     */
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    /**
     * Get a tool by name
     * @param name The name of the tool to get
     */
    getTool(name) {
        return this.tools.get(name);
    }
    /**
     * Get all available tools
     */
    getTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Execute a tool by name
     * @param name The name of the tool to execute
     * @param args The arguments to pass to the tool
     */
    async executeTool(name, ...args) {
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        return tool.execute(...args);
    }
}
exports.BaseToolkit = BaseToolkit;
