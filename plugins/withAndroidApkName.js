const { withAppBuildGradle } = require('@expo/config-plugins');

const APK_NAME_BLOCK = `
android.applicationVariants.all { variant ->
    variant.outputs.all {
        outputFileName = "SmartRecycleAI-v\${variant.versionName}-\${variant.buildType.name}.apk"
    }
}
`;

module.exports = (config) =>
    withAppBuildGradle(config, (mod) => {
        const gradle = mod.modResults.contents;
        if (!gradle.includes('outputFileName = "SmartRecycleAI')) {
            mod.modResults.contents = gradle.replace(
                /(\s*androidResources\s*\{[^}]*\}\s*\})/,
                `$1${APK_NAME_BLOCK}`
            );
        }
        return mod;
    });
