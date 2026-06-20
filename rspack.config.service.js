const path = require("path");
const fs = require("fs");
const { CopyRspackPlugin } = require("@rspack/core");

const nodeBuiltins = new Set([
  "child_process", "crypto", "fs", "http", "https", "os", "path", "url",
  "util", "zlib", "net", "stream", "tls", "dns", "events", "querystring",
  "buffer", "assert", "constants", "vm", "worker_threads", "perf_hooks",
]);

function scanImports(dir) {
  const imports = new Set();
  const importRe = /(?:import\s+[\s\S]*?from\s+["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\))/g;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const imp of scanImports(full)) imports.add(imp);
    } else if (/\.[jt]s$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf-8");
      let m;
      while ((m = importRe.exec(content))) {
        const req = m[1] || m[2];
        if (req && !/^\./.test(req)) imports.add(req);
      }
    }
  }
  return imports;
}

function getPkgName(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? parts[0] + "/" + parts[1] : spec;
  }
  return spec.split("/")[0];
}

class GenerateDistPkgPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap("GenerateDistPkgPlugin", (compilation) => {
      const servicesDir = path.join(compiler.context, "src", "services");
      const raw = fs.readFileSync(
        path.join(compiler.context, "package.json"),
        "utf-8",
      );
      const pkg = JSON.parse(raw);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
      const dependencies = {};

      for (const imp of scanImports(servicesDir)) {
        const name = getPkgName(imp);
        if (nodeBuiltins.has(name)) continue;
        if (allDeps[name] && !dependencies[name]) {
          dependencies[name] = allDeps[name];
        }
      }

      const output = {
        name: "mmfm-service",
        version: pkg.version,
        private: true,
        main: "service.js",
        packageManager: pkg.packageManager,
        dependencies,
      };

      compilation.emitAsset(
        "package.json",
        new compiler.webpack.sources.RawSource(JSON.stringify(output, null, 2)),
      );
    });
  }
}

module.exports = {
  mode: "production",
  entry: "./src/services/WebService.ts",
  target: "node",

  output: {
    path: path.resolve("dist"),
    filename: "service.js",
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  externalsPresets: { node: true },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: { parser: { syntax: "typescript" } },
            },
          },
        ],
        type: "javascript/auto",
      },
    ],
  },
  externals: [
    function ({ request }, callback) {
      if (/^\./.test(request)) return callback();
      return callback(null, "commonjs " + request);
    },
  ],

  plugins: [
    new CopyRspackPlugin({
      patterns: [{ from: "src/services/swagger.json", to: "." }],
    }),
    new GenerateDistPkgPlugin(),
  ],

  optimization: { minimize: false },
  devtool: false,
};
