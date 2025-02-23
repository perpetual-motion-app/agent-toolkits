import { BaseToolkit, Tool } from '@agent-toolkits/base';
export declare class JupiterGetNewPoolsToolkit extends BaseToolkit {
    constructor();
    /**
     * Convert a Jupiter pool to the normalized format
     */
    private normalizePool;
    private fetchPoolsPage;
    private filterPoolsByAge;
    getNewPoolsTool(): Tool;
}
export * from './types';
