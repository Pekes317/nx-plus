import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { getSystemPath, join, normalize, Path } from '@angular-devkit/core';
import chalk from 'chalk';
import { from, merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map, switchMap } from 'rxjs/operators';

import { SSRBuilderSchema } from './schema';
import { createServerSideTemplate } from '../../ssr-template';
import {
  checkUnsupportedConfig,
  getProjectRoot,
  modifyChalkOutput,
  RenderTarget,
} from '../../utils';
import {
  addServerSideRender,
  copyStaticAssets,
  modifyCachePaths,
  modifyEntryPoint,
  modifyIndexHtmlPath,
  modifyTsConfigPaths,
  modifyTypescriptAliases,
} from '../../webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Service = require('@vue/cli-service/lib/Service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolvePkg } = require('@vue/cli-shared-utils/lib/pkg');

export function runBuilder(
  options: SSRBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  async function setup(
    target: RenderTarget
  ): Promise<{
    projectRoot: Path;
    inlineOptions;
  }> {
    const projectRoot = await getProjectRoot(context);
    const pluginConfig = options.pluginConfig || {};

    const inlineOptions = {
      chainWebpack: (config) => {
        modifyIndexHtmlPath(config, options, context);
        modifyEntryPoint(config, options, context);
        modifyTsConfigPaths(config, options, context);
        modifyCachePaths(config, context);
        modifyTypescriptAliases(config, options, context);
        addServerSideRender(config, options, context, target);
        copyStaticAssets(config, options, context);
      },
      publicPath: options.publicPath,
      filenameHashing: options.filenameHashing,
      productionSourceMap: options.productionSourceMap,
      css: options.css,
      ...pluginConfig,
    };

    return {
      projectRoot,
      inlineOptions,
    };
  }

  // The compiled files output by vue-cli are not relative to the
  // root of the workspace. We can spy on chalk to intercept the
  // console output and tranform any non-relative file paths.
  // TODO: Find a better way to rewrite vue-cli console output
  const chalkTransform = (arg: string) => {
    const normalizedArg = normalize(arg);
    return normalizedArg.includes(options.dest)
      ? options.dest + normalizedArg.split(options.dest)[1]
      : arg;
  };
  ['green', 'cyan', 'blue'].forEach((color) =>
    modifyChalkOutput(color, chalkTransform)
  );

  return merge(
    from(setup(RenderTarget.client)).pipe(
      switchMap(({ projectRoot, inlineOptions }) => {
        checkUnsupportedConfig(context, projectRoot);

        const service = new Service(projectRoot, {
          pkg: resolvePkg(context.workspaceRoot),
          inlineOptions,
        });
        const buildOptions = {
          mode: options.mode,
          dest: getSystemPath(
            join(normalize(context.workspaceRoot), options.dest)
          ),
          modern: false,
          'unsafe-inline': true,
          clean: options.clean,
          report: options.report,
          'report-json': options.reportJson,
          'skip-plugins': options.skipPlugins,
          watch: options.watch,
        };

        if (options.watch) {
          return new Observable((obs) => {
            service
              .run('build', buildOptions, ['build'])
              .then((success) => obs.next(success))
              .catch((err) => obs.error(err));
          });
        }

        return from(service.run('build', buildOptions, ['build']));
      }),
      map(() => ({ success: true }))
    ),
    from(setup(RenderTarget.server)).pipe(
      switchMap(({ projectRoot, inlineOptions }) => {
        checkUnsupportedConfig(context, projectRoot);

        const service = new Service(projectRoot, {
          pkg: resolvePkg(context.workspaceRoot),
          inlineOptions,
        });
        const buildOptions = {
          mode: options.mode,
          dest: getSystemPath(
            join(normalize(context.workspaceRoot), options.dest)
          ),
          modern: false,
          'unsafe-inline': true,
          clean: options.clean,
          report: options.report,
          'report-json': options.reportJson,
          'skip-plugins': options.skipPlugins,
          watch: options.watch,
        };

        if (options.watch) {
          return new Observable((obs) => {
            service
              .run('build', buildOptions, ['build'])
              .then((success) => obs.next(success))
              .catch((err) => obs.error(err));
          });
        }

        return from(service.run('build', buildOptions, ['build']));
      }),
      map(() => ({ success: true }))
    )
  ).pipe(
    tap(
      () => chalk.bgGreenBright('Completing Build'),
      () => chalk.redBright('Error Occurred Creating Template'),
      () =>
        createServerSideTemplate(options.index, options.dest, options.template)
    )
  );
}

export default createBuilder(runBuilder);
