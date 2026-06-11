const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidApkName(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes('outputFileName')) {
      return mod;
    }

    const appName = (config.name || 'app').replace(/\s+/g, '-');
    const version = config.version || '1.0.0';
    const buildTypeVar = '${variant.buildType.name}';

    const snippet = [
      '    applicationVariants.all { variant ->',
      '        variant.outputs.all {',
      `            outputFileName = "${appName}-v${version}-${buildTypeVar}.apk"`,
      '        }',
      '    }',
    ].join('\n');

    mod.modResults.contents = mod.modResults.contents.replace(
      /(\s*buildTypes\s*\{)/,
      '\n' + snippet + '\n$1'
    );

    return mod;
  });
};
