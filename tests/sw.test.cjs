const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const scope = "https://example.test/Caminho-do-Imperador-Alagoas/";
const mapUrl = new URL("alagoas.pmtiles", scope).href;
const indexUrl = new URL("index.html", scope).href;
const handlers = {};
const mapBytes = Buffer.from("0123456789");
let installedFiles;
const cache = {
  async addAll(files) {
    installedFiles = files;
    for (const file of files) {
      const localPath = file === "./" ? "index.html" : file.slice(2);
      assert.ok(fs.existsSync(path.join(__dirname, "..", localPath)), localPath);
    }
  },
  async match(request) {
    const url = request instanceof URL ? request.href : typeof request === "string" ? request : request.url;
    if (url === mapUrl) return new Response(mapBytes);
    if (url === indexUrl) return new Response("offline page");
    return undefined;
  }
};

vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8"), {
  URL,
  Response,
  caches: { open: async () => cache },
  fetch: () => { throw new Error("Network access was not expected"); },
  self: {
    registration: { scope },
    location: { origin: new URL(scope).origin },
    skipWaiting: async () => {},
    addEventListener(type, handler) { handlers[type] = handler; }
  }
});

function handle(request) {
  let response;
  handlers.fetch({ request, respondWith(value) { response = value; } });
  return response;
}

test("prepares every required local asset for offline use", async () => {
  let completed;
  handlers.install({ waitUntil(value) { completed = value; } });
  await completed;
  assert.ok(installedFiles.includes("./alagoas.pmtiles"));
});

test("serves PMTiles byte ranges from the offline copy", async () => {
  const request = new Request(mapUrl, { headers: { Range: "bytes=2-5" } });
  const response = await handle(request);
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("Content-Range"), "bytes 2-5/10");
  assert.equal(await response.text(), "2345");
});

test("serves the app page when offline", async () => {
  const response = await handle({ url: scope, method: "GET", mode: "navigate" });
  assert.equal(await response.text(), "offline page");
});
