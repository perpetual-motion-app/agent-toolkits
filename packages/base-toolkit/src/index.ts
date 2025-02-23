export interface Tool {
  name: string;
  description: string;
  execute: (...args: any[]) => Promise<any>;
}

export abstract class BaseToolkit {
  protected tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a new tool in the toolkit
   * @param tool The tool to register
   */
  protected registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   * @param name The name of the tool to get
   */
  public getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all available tools
   */
  public getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute a tool by name
   * @param name The name of the tool to execute
   * @param args The arguments to pass to the tool
   */
  public async executeTool(name: string, ...args: any[]): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return tool.execute(...args);
  }
} 