// ===== Provider 配置类型 =====

/** 单个 API 提供商（渠道）配置 */
export interface ProviderConfig {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 接口类型（影响请求格式和端点路径） */
  type: 'openai' | 'anthropic' | 'gemini';
  /** API 域名（只填域名，不含路径，如 https://api.deepseek.com） */
  baseUrl: string;
  /** API Key 对应的环境变量名 */
  apiKeyEnv: string;
  /** 默认模型 */
  defaultModel: string;
  /** 可用模型列表 */
  models: string[];
  /**
   * API 路径前缀（可选）
   * 默认值按 type 自动适配：
   *   openai    → /v1
   *   anthropic → (不需要额外前缀，直接 /v1/messages)
   *   gemini    → /v1beta
   * 需要自定义时设置，如 OpenRouter 用 /api/v1
   */
  pathPrefix?: string;
  /** 额外请求头 */
  headers?: Record<string, string>;
  /** 描述 */
  description?: string;
}

/** 运行时解析后的完整 Provider 信息 */
export interface ResolvedProvider {
  config: ProviderConfig;
  apiKey: string;
  /** 解析后的基础地址（域名 + 路径前缀） */
  resolvedBaseUrl: string;
}

/** 当前激活状态 */
export interface ActiveProviderState {
  providerId: string;
  model: string;
}

// ===== 用户自定义 Provider =====

/** 用户在设置页自定义的 API Provider */
export interface CustomProvider {
  /** 唯一标识（自动生成 UUID） */
  id: string;
  /** 显示名称 */
  name: string;
  /** API 基础地址 */
  baseUrl: string;
  /** API Key */
  apiKey: string;
  /** 接口类型 */
  type: 'openai' | 'anthropic' | 'gemini';
  /** 可用模型列表（从接口获取或手动填写） */
  models: string[];
  /** 选中的默认模型 */
  defaultModel: string;
  /** 路径前缀（可选） */
  pathPrefix?: string;
  /** 创建时间 */
  createdAt: string;
}

/** 设置页配置（localStorage 持久化） */
export interface UserSettings {
  customProviders: CustomProvider[];
  // 后续可扩展：默认导出格式、主题等
}
