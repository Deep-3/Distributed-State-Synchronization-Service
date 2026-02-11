import { Controller, Get, Res } from "@nestjs/common";
import { ApiProduces, ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

import { ApiTag } from "src/constants/api-tags.constants";

import { COLLAB } from "./collaboration.constants";

import type { Response } from "express";

@ApiTags(ApiTag.Collaboration)
@Controller("collab")
export class CollaborationController {
  @Get("test")
  @ApiOperation({
    summary: COLLAB.SWAGGER.SUMMARY,
    description: COLLAB.SWAGGER.DESCRIPTION,
  })
  @ApiResponse({ status: 200, description: "HTML test page", content: { "text/html": {} } })
  getTestPage(@Res() res: Response): void {
    res.type("html");
    res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Yjs Socket.IO Test</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
      .row { display: flex; gap: 16px; flex-wrap: wrap; }
      .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; max-width: 920px; width: 100%; }
      .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
      textarea { width: 100%; min-height: 240px; font-size: 14px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; }
      textarea:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
      pre { background: #0b1020; color: #e5e7eb; padding: 12px; border-radius: 10px; overflow: auto; max-height: 240px; }
      .pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; border: 1px solid #e5e7eb; font-size: 12px; }
      .dot { width: 10px; height: 10px; border-radius: 999px; background: #9ca3af; }
      .dot.ok { background: #22c55e; }
      .dot.bad { background: #ef4444; }
      .topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
      .muted { color: #6b7280; font-size: 12px; }
      .btn { cursor: pointer; border: 1px solid #e5e7eb; background: white; border-radius: 8px; padding: 8px 10px; font-size: 12px; }
      .btn:active { transform: translateY(1px); }
      .field { display: flex; flex-direction: column; gap: 6px; min-width: 240px; flex: 1; }
      .input { width: 100%; font-size: 13px; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; }
      .input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div>
        <div style="font-size:18px;font-weight:700;">Distributed State Synchronization Service</div>
        <div class="muted">Room: <b id="room"></b> </div>
        <div class="muted">You: <code id="clientId">-</code></div>
      </div>
      <div class="pill"><span id="statusDot" class="dot"></span><span id="statusText">disconnected</span></div>
    </div>

    <div class="row">
      <div class="card">
        <div class="label">Connection</div>
        <div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: end;">
          <div class="field">
            <div class="muted">Socket URL (Socket.IO namespace)</div>
            <input id="socketUrl" class="input" placeholder="http://localhost:3000/ws" />
          </div>
          <div class="field" style="max-width: 280px;">
            <div class="muted">Room</div>
            <input id="roomInput" class="input" placeholder="demo" />
          </div>
          <button id="joinBtn" class="btn">Join Room</button>
          <button id="copyLink" class="btn">Copy test link</button>
        </div>
      </div>

      <div class="card">
        <div class="label">Shared JSON</div>
        <textarea id="editor" spellcheck="false"></textarea>
        <div id="jsonError" class="muted" style="margin-top: 8px; color: #b91c1c;"></div>
        <div style="display:flex; gap: 10px; align-items:center; margin-top: 10px; flex-wrap: wrap;">
          <button id="clear" class="btn">Clear (local)</button>
          <button id="reconnect" class="btn">Reconnect</button>
        </div>
      </div>

      <div class="card">
        <div class="label">Logs</div>
        <pre id="logs"></pre>
      </div>
    </div>

    <script type="module">
      import { io } from "https://esm.sh/socket.io-client@4.7.5";
      import * as Y from "https://esm.sh/yjs@13.6.14";

      let joinedRoomId = "";
      let pendingJoinRoomId = "";
      document.getElementById("room").textContent = "(not joined)";

      const logsEl = document.getElementById("logs");
      const statusDot = document.getElementById("statusDot");
      const statusText = document.getElementById("statusText");
      const clientIdEl = document.getElementById("clientId");
      const lastChangeEl = document.getElementById("lastChange");
      const editor = document.getElementById("editor");
      const jsonErrorEl = document.getElementById("jsonError");
      const socketUrlInput = document.getElementById("socketUrl");
      const roomInput = document.getElementById("roomInput");

      const formatTs = (ts) => {
        try {
          return new Date(ts).toISOString();
        } catch {
          return String(ts);
        }
      };

      const jsonPreview = () => {
        try {
          const json = fromYToJson(yroot);
          const s = JSON.stringify(json);
          if (s.length <= 180) return s;
          return s.slice(0, 180) + "...";
        } catch {
          return "<unavailable>";
        }
      };

      const setLastChange = (senderId, ts) => {
        const who = senderId || "unknown";
        const when = ts ? formatTs(ts) : formatTs(Date.now());
        lastChangeEl.textContent = who + " @ " + when + " | " + jsonPreview();
      };

      const logUpdate = (kind, details) => {
        const ts = details && details.ts ? details.ts : Date.now();
        const lineTs = formatTs(ts);
        const by = details && details.by ? details.by : "unknown";
        if (kind === "fetch successfully") {
          logsEl.textContent += "[" + lineTs + "] " + kind + "\\n";
        } else if (kind === "update" || kind === "sent") {
          logsEl.textContent += "[" + lineTs + "] User-" + by + " updated document\\n";
        } else {
          logsEl.textContent += "[" + lineTs + "] " + kind + " by=" + by + "\\n";
        }
        logsEl.scrollTop = logsEl.scrollHeight;
      };

      const uint8ToBase64 = (u8) => {
        let s = "";
        const chunk = 0x8000;
        for (let i = 0; i < u8.length; i += chunk) {
          s += String.fromCharCode(...u8.subarray(i, i + chunk));
        }
        return btoa(s);
      };

      const base64ToUint8 = (b64) => {
        const bin = atob(b64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return u8;
      };

      let ydoc;
      let yroot;
      let docDeepUnsub = null;
      let docUpdateHandler = null;
      let hasSynced = false;

      let applyingRemote = false;
      let socket;

      const setStatus = (state) => {
        statusDot.classList.remove("ok", "bad");
        if (state === "connected") statusDot.classList.add("ok");
        if (state === "error") statusDot.classList.add("bad");
        statusText.textContent = state;
      };

      const isPlainObject = (v) => Object.prototype.toString.call(v) === "[object Object]";

      const fromJsonToY = (value) => {
        if (value === null) return null;
        if (typeof value !== "object") return value;
        if (Array.isArray(value)) {
          const ya = new Y.Array();
          ya.push(value.map(fromJsonToY));
          return ya;
        }
        if (isPlainObject(value)) {
          const ym = new Y.Map();
          for (const [k, v] of Object.entries(value)) ym.set(k, fromJsonToY(v));
          return ym;
        }
        return String(value);
      };

      const fromYToJson = (value) => {
        if (value instanceof Y.Map) {
          const obj = {};
          value.forEach((v, k) => {
            obj[k] = fromYToJson(v);
          });
          return obj;
        }
        if (value instanceof Y.Array) {
          return value.toArray().map(fromYToJson);
        }
        return value;
      };

      const renderFromYRoot = () => {
        const json = fromYToJson(yroot);
        const next = JSON.stringify(json, null, 2);
        if (editor.value !== next) editor.value = next;
      };

      const setJsonError = (msg) => {
        jsonErrorEl.textContent = msg || "";
      };

      const resetYDoc = () => {
        if (docDeepUnsub) {
          docDeepUnsub();
          docDeepUnsub = null;
        }
        if (ydoc && docUpdateHandler) {
          try {
            ydoc.off("update", docUpdateHandler);
          } catch {
            // ignore
          }
          docUpdateHandler = null;
        }
        if (ydoc) {
          try {
            ydoc.destroy();
          } catch {
            // ignore
          }
        }

        hasSynced = false;
        ydoc = new Y.Doc();
        yroot = ydoc.getMap("json");

        const deepObserver = () => {
          if (applyingRemote) return;
          setJsonError("");
          renderFromYRoot();
        };
        yroot.observeDeep(deepObserver);
        docDeepUnsub = () => {
          try {
            yroot.unobserveDeep(deepObserver);
          } catch {
            // ignore
          }
        };

        renderFromYRoot();
      };

      resetYDoc();

      let inputTimer;
      editor.addEventListener("input", () => {
        if (!joinedRoomId) {
          setJsonError("Join a room first.");
          return;
        }
        if (!hasSynced) {
          setJsonError("Waiting for initial sync from server...");
          return;
        }
        if (inputTimer) clearTimeout(inputTimer);
        inputTimer = setTimeout(() => {
          let parsed;
          try {
            parsed = editor.value.trim() ? JSON.parse(editor.value) : {};
          } catch (e) {
            return;
          }

          setJsonError("");
          ydoc.transact(() => {
            yroot.clear();
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              for (const [k, v] of Object.entries(parsed)) {
                yroot.set(k, fromJsonToY(v));
              }
            } else {
              yroot.set("value", fromJsonToY(parsed));
            }
          }, "local-json-input");
        }, 250);
      });

      const bindDocUpdateHandler = () => {
        docUpdateHandler = (update) => {
          if (applyingRemote) return;
          if (!socket || !socket.connected) return;
          if (!joinedRoomId) return;
          if (!hasSynced) return;

          const updateBase64 = uint8ToBase64(update);
          socket.emit("update", { roomId: joinedRoomId, updateBase64 });
          logUpdate("sent", {
            by: socket && socket.id ? socket.id : "local",
            ts: Date.now(),
            bytes: update.length,
          });
          setLastChange(socket && socket.id ? socket.id : "local", Date.now());
        };
        ydoc.on("update", docUpdateHandler);
      };

      bindDocUpdateHandler();

      // NOTE: resetYDoc() creates a new doc; re-bind the update handler each time.
      const resetYDocAndRebind = () => {
        resetYDoc();
        bindDocUpdateHandler();
      };

      const joinRoom = () => {
        const nextRoom = String(roomInput.value || "").trim() || "demo";
        if (!socket || !socket.connected) {
          pendingJoinRoomId = nextRoom;
          connect();
          return;
        }

        joinedRoomId = nextRoom;
        document.getElementById("room").textContent = joinedRoomId;
        resetYDocAndRebind();
        socket.emit("join", { roomId: joinedRoomId });
      };

      const connect = () => {
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }

        setStatus("connecting");
        const url = String(socketUrlInput.value || "").trim() || (location.origin + "/ws");
        socket = io(url, {
          transports: ["websocket"],
          withCredentials: true,
        });

        socket.on("connect", () => {
          setStatus("connected");
          clientIdEl.textContent = socket.id;
          if (pendingJoinRoomId) {
            const toJoin = pendingJoinRoomId;
            pendingJoinRoomId = "";
            joinedRoomId = toJoin;
            document.getElementById("room").textContent = joinedRoomId;
            resetYDocAndRebind();
            socket.emit("join", { roomId: joinedRoomId });
          }
        });

        socket.on("disconnect", (reason) => {
          setStatus("disconnected");
        });

        socket.on("connect_error", (err) => {
          setStatus("error");
        });

        socket.on("error", (payload) => {
          setStatus("error");
        });

        socket.on("sync", (payload) => {
          if (!payload?.updateBase64) return;
          if (!joinedRoomId) return;
          if (payload?.roomId && payload.roomId !== joinedRoomId) return;
          applyingRemote = true;
          try {
            const update = base64ToUint8(payload.updateBase64);
            Y.applyUpdate(ydoc, update, "remote-sync");
            hasSynced = true;
            logUpdate("fetch successfully", {
              by: payload && payload.senderId ? payload.senderId : "server",
              ts: payload && payload.ts ? payload.ts : Date.now(),
            });
            renderFromYRoot();
            setLastChange(payload && payload.senderId ? payload.senderId : "server", payload && payload.ts ? payload.ts : Date.now());
          } finally {
            applyingRemote = false;
          }
        });

        socket.on("update", (payload) => {
          if (!payload?.updateBase64) return;
          if (!joinedRoomId) return;
          if (!hasSynced) return;
          if (payload?.roomId && payload.roomId !== joinedRoomId) return;
          applyingRemote = true;
          try {
            const update = base64ToUint8(payload.updateBase64);
            Y.applyUpdate(ydoc, update, "remote-update");
            logUpdate("update", {
              by: payload && payload.senderId ? payload.senderId : "unknown",
              ts: payload && payload.ts ? payload.ts : Date.now(),
            });
            renderFromYRoot();
            setLastChange(payload && payload.senderId ? payload.senderId : "unknown", payload && payload.ts ? payload.ts : Date.now());
          } finally {
            applyingRemote = false;
          }
        });
      };

      document.getElementById("clear").addEventListener("click", () => {
        if (!joinedRoomId) {
          setJsonError("Join a room first.");
          return;
        }
        if (!hasSynced) {
          setJsonError("Waiting for initial sync from server...");
          return;
        }
        ydoc.transact(() => {
          yroot.clear();
        }, "local-clear");
        setJsonError("");
        renderFromYRoot();
      });

      document.getElementById("reconnect").addEventListener("click", () => {
        connect();
      });

      document.getElementById("joinBtn").addEventListener("click", () => {
        joinRoom();
      });

      document.getElementById("copyLink").addEventListener("click", async () => {
        const link = location.origin + "/api/v1/collab/test";
        try {
          await navigator.clipboard.writeText(link);
          log("copied", link);
        } catch {
          log("copy failed", link);
        }
      });

      renderFromYRoot();
      socketUrlInput.value = location.origin + "/ws";
      roomInput.value = "demo";
      connect();
    </script>
  </body>
</html>`);
  }
}
