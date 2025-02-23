"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeckoTerminalGetNewPoolsToolkit = void 0;
const base_1 = require("@agent-toolkits/base");
const axios_1 = __importStar(require("axios"));
const BASE_URL = "https://api.geckoterminal.com/api/v2";
class GeckoTerminalGetNewPoolsToolkit extends base_1.BaseToolkit {
    constructor() {
        super();
        this.registerTool(this.getNewPoolsTool());
    }
    getNewPoolsTool() {
        return {
            name: 'getNewPools',
            description: 'Fetches new pools from GeckoTerminal API',
            execute: async (params = {}) => {
                const { network = 'solana', page = 1, limit = 100 } = params;
                try {
                    const response = await axios_1.default.get(`${BASE_URL}/networks/${network}/new_pools`, {
                        params: {
                            page,
                            limit
                        },
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    return response.data;
                }
                catch (error) {
                    if (error instanceof axios_1.AxiosError) {
                        throw new Error(`GeckoTerminal API error: ${error.message}`);
                    }
                    throw error;
                }
            }
        };
    }
}
exports.GeckoTerminalGetNewPoolsToolkit = GeckoTerminalGetNewPoolsToolkit;
// Export types
__exportStar(require("./types"), exports);
