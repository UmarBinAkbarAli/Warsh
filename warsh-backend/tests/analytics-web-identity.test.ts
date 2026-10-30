import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import path from "node:path";

test("web analytics gates events and profiles and separates switched accounts", async () => {
  const state = { token: "session", user: { id: "adult-a", dateOfBirth: "1990-01-01", isMinor: false } as any };
  const calls: Array<{ kind: string; value?: unknown }> = [];
  const storage = new Map<string, string>();
  const globals = globalThis as any;
  globals.__warshAnalyticsHarness = { state, calls, storage, browserUserId: "previous-browser-user" };
  const mocks: Record<string, string> = {
    "react-native": `export const Platform={OS:'web'}; export const NativeModules={};`,
    "mixpanel-react-native": `export class Mixpanel {}`,
    "@stores/authStore": `export const useAuthStore={getState:()=>globalThis.__warshAnalyticsHarness.state};`,
    "@react-native-async-storage/async-storage": `export default {getItem:async k=>globalThis.__warshAnalyticsHarness.storage.get(k)??null,setItem:async(k,v)=>{globalThis.__warshAnalyticsHarness.storage.set(k,v)}};`,
    "mixpanel-browser": `const h=globalThis.__warshAnalyticsHarness,c=h.calls; export default {init:()=>c.push({kind:'init'}),get_property:k=>k==='$user_id'?h.browserUserId:undefined,identify:v=>{h.browserUserId=v;c.push({kind:'identify',value:v})},reset:()=>{h.browserUserId=null;c.push({kind:'reset'})},track:(e,p)=>c.push({kind:'track',value:{event:e,props:p}}),people:{set:p=>c.push({kind:'people',value:p}),set_once:p=>c.push({kind:'people',value:p}),increment:(k,v)=>c.push({kind:'people',value:{k,v}})}};`,
  };
  const built = await build({
    entryPoints: [path.resolve(process.cwd(), "../warsh-app/services/analytics.ts")], bundle: true,
    platform: "node", format: "cjs", write: false,
    define: { "process.env.EXPO_PUBLIC_MIXPANEL_TOKEN": '"test-only"', "process.env.EXPO_PUBLIC_ENVIRONMENT": '"test"' },
    plugins: [{ name: "analytics-fakes", setup(b) {
      b.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: "fake" } : undefined);
      b.onLoad({ filter: /.*/, namespace: "fake" }, args => ({ contents: mocks[args.path], loader: "js" }));
    } }],
  });
  const module = { exports: {} as any };
  new Function("module", "exports", "require", built.outputFiles[0].text)(module, module.exports, createRequire(import.meta.url));
  const analytics = module.exports;
  try {
    assert.equal(await analytics.track("adult_event"), true);
    assert.deepEqual(calls.filter(c => c.kind === "identify").map(c => c.value), ["adult-a"]);
    assert.ok(calls.findIndex(c => c.kind === "reset") < calls.findIndex(c => c.kind === "identify"));
    assert.equal((calls.find(c => c.kind === "track")?.value as any).props.surface, "web_app");

    state.user = { id: "minor", dateOfBirth: "2014-01-01", isMinor: true };
    const beforeMinor = calls.length;
    assert.equal(await analytics.track("minor_event"), false);
    analytics.setPeopleProps({ test: true });
    analytics.identifyUser("minor", { test: true });
    analytics.trackSignupCompleted({ goal: "", level: "", placement: "", language: "en" });
    analytics.trackNoorMessageSent(1);
    analytics.trackSRSReviewCompleted({ wordsReviewed: 1, hard: 0, good: 1, easy: 0 });
    analytics.trackSubscriptionStarted("monthly");
    await Promise.resolve();
    assert.equal(calls.length, beforeMinor);

    state.user = { id: "unknown", dateOfBirth: null, isMinor: null };
    assert.equal(await analytics.track("unknown_event"), false);
    assert.equal(calls.length, beforeMinor);

    state.user = { id: "adult-b", dateOfBirth: "1991-01-01", isMinor: false };
    assert.equal(await analytics.track("adult_b_event"), true);
    assert.deepEqual(calls.filter(c => c.kind === "identify").map(c => c.value), ["adult-a", "adult-b"]);
    const reset = calls.findLastIndex(c => c.kind === "reset");
    const secondIdentify = calls.findIndex(c => c.kind === "identify" && c.value === "adult-b");
    assert.ok(reset >= 0 && reset < secondIdentify);

    const pending = analytics.track("queued_for_old_account");
    state.user = { id: "minor", dateOfBirth: "2014-01-01", isMinor: true };
    assert.equal(await pending, false);
    assert.equal(calls.filter(c => c.kind === "track").length, 2);

    state.token = "";
    assert.equal(await analytics.track("logged_out"), false);
    assert.equal(calls.filter(c => c.kind === "track").length, 2);
  } finally {
    delete globals.__warshAnalyticsHarness;
  }
});
