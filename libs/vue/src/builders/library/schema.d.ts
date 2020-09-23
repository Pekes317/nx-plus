import { JsonObject } from '@angular-devkit/core';

import { FileReplacements } from '../../utils';

export interface LibraryBuilderSchema extends JsonObject {
  dest: string;
  clean: boolean;
  report: boolean;
  reportJson: boolean;
  skipPlugins?: string;
  watch: boolean;
  entry: string;
  tsConfig: string;
  inlineVue: boolean;
  fileReplacements?: FileReplacements[];
  css: {
    requireModuleExtension: boolean;
    extract: boolean | object;
    sourceMap: boolean;
    loaderOptions: object;
  };
  formats: string;
  name?: string;
  filename?: string;
}
