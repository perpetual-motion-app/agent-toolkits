import { BaseToolkit, Tool } from '@agent-toolkits/base';
export declare class GeckoTerminalGetNewPoolsToolkit extends BaseToolkit {
    constructor();
    /**
     * Convert a GeckoTerminal pool to the normalized format
     */
    private normalizePool;
    getNewPoolsTool(): Tool;
}
export * from './types';
