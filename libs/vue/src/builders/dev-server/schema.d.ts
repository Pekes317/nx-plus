import { JsonObject } from '@angular-devkit/core';

export interface DevServerBuilderSchema extends JsonObject {
  open: boolean;
  copy: boolean;
  stdin: boolean;
  assets?: string[];
  mode?: string;
  host: string;
  port: number;
  https: boolean;
  public?: string;
  skipPlugins?: string;
  browserTarget: string;
  watch: boolean;
  publicPath?: string;
  css: {
    requireModuleExtension?: boolean;
    extract?: boolean | object;
    sourceMap?: boolean;
    loaderOptions: object;
  };
  pluginConfig?: Record<string, unknown>;
  devServer: object;
}
