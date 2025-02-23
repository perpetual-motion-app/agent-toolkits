export interface Tool {
    name: string;
    description: string;
    execute: (...args: any[]) => Promise<any>;
}
export declare abstract class BaseToolkit {
    protected tools: Map<string, Tool>;
    constructor();
    /**
     * Register a new tool in the toolkit
     * @param tool The tool to register
     */
    protected registerTool(tool: Tool): void;
    /**
     * Get a tool by name
     * @param name The name of the tool to get
     */
    getTool(name: string): Tool | undefined;
    /**
     * Get all available tools
     */
    getTools(): Tool[];
    /**
     * Execute a tool by name
     * @param name The name of the tool to execute
     * @param args The arguments to pass to the tool
     */
    executeTool(name: string, ...args: any[]): Promise<any>;
}
