(function (root) {
  "use strict";

  var ns = root.LearningPlatformContent = root.LearningPlatformContent || {};
  var STORAGE_PREFIX = "learning-platform.content.draft.v1";

  function memoryStorage() {
    var data = {};
    return {
      getItem: function (key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
      setItem: function (key, value) { data[key] = String(value); },
      removeItem: function (key) { delete data[key]; }
    };
  }

  function safeStorage(preferred) {
    if (preferred) return preferred;
    try {
      if (root.localStorage) return root.localStorage;
    } catch (error) {
      return memoryStorage();
    }
    return memoryStorage();
  }

  function learnerKey(options) {
    var platform;
    var session;
    if (options && options.learnerKey) return String(options.learnerKey);
    platform = root.LearningPlatform && root.LearningPlatform.platform;
    session = platform && platform.auth && typeof platform.auth.getSession === "function"
      ? platform.auth.getSession()
      : null;
    if (session && session.user && session.user.id) return "auth:" + session.user.id;
    if (platform && platform.auth && typeof platform.auth.isSignedIn === "function" && platform.auth.isSignedIn()) {
      return "authenticated";
    }
    return "guest";
  }

  function storageKey(activityId, options) {
    return STORAGE_PREFIX + ":" + encodeURIComponent(learnerKey(options)) + ":" + encodeURIComponent(activityId);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function emptyDraft(activity) {
    return {
      activityId: activity.id,
      activityVersion: activity.version || "0.1.0",
      startedAt: new Date().toISOString(),
      completedAt: null,
      responses: {},
      checked: {},
      completed: false,
      submission: { status: "local" }
    };
  }

  ns.DRAFT_STORAGE_PREFIX = STORAGE_PREFIX;
  ns.createMemoryStorage = memoryStorage;

  ns.createDraftStore = function (activity, options) {
    var storage = safeStorage(options && options.storage);
    var key = storageKey(activity.id, options);

    function read() {
      try {
        var raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    }

    function write(draft) {
      try {
        storage.setItem(key, JSON.stringify(draft));
        return true;
      } catch (error) {
        return false;
      }
    }

    function load() {
      var stored = read();
      if (!stored || stored.activityId !== activity.id) return emptyDraft(activity);
      if (stored.activityVersion !== (activity.version || "0.1.0")) return emptyDraft(activity);
      return stored;
    }

    function save(draft) {
      write(draft);
      return draft;
    }

    function reset() {
      try { storage.removeItem(key); } catch (error) {}
      var draft = emptyDraft(activity);
      write(draft);
      return draft;
    }

    return {
      key: key,
      load: load,
      save: save,
      reset: reset
    };
  };

  ns.summariseDraft = function (activity, options) {
    var store = ns.createDraftStore(activity, options);
    var draft = store.load();
    if (draft.completed) return { status: "practised", label: "Practised" };
    if (draft.responses && Object.keys(draft.responses).length) return { status: "started", label: "Started" };
    return { status: "not-started", label: "Not started" };
  };

  ns.cloneDraft = clone;
})(typeof globalThis !== "undefined" ? globalThis : this);
