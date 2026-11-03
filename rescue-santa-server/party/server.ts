import type * as Party from "partykit/server";
import type { ClientMessage, EnemyState, PlayerState, RoundState, ServerMessage } from "../lib/protocol";
import {
  collidesWorld, enemyPosition, ENEMY_COUNT, INTERACTION_RANGE, MAX_PLAYERS,
  PLAYER_SPEED, RESCUE_DURATION_MS, ROUND_RESET_MS, spawnPosition, WORLD_HALF
} from "../lib/world";

type PlayerInternal = PlayerState & {
  lastMove: number;
  lastThrow: number;
  holdSince: number | null;
  invulnerableUntil: number;
};

const COLORS = ["#4ef2ca", "#ff6584", "#ffe376", "#9b87ff", "#57b7ff", "#ff9c55", "#a4ff82", "#f390ff", "#ffffff", "#72f5ff", "#fd7eec", "#9effa9"];
const safeName = (name: string) => name.replace(/[^\p{L}\p{N} _-]/gu, "").trim().slice(0, 18) || "Christmas Elf";
const validNumber = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const asPublic = (p: PlayerInternal): PlayerState => ({
  id: p.id, name: p.name, color: p.color, x: p.x, y: p.y, z: p.z,
  yaw: p.yaw, score: p.score, stunnedUntil: p.stunnedUntil, interacting: p.interacting
});

export default class RescueSantaRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}
  private players = new Map<string, PlayerInternal>();
  private enemyStun = new Map<number, number>();
  private ticker: ReturnType<typeof setInterval> | undefined;
  private round: RoundState = {
    round: 1, status: "playing", winner: null, winnerName: null,
    resetAt: 0, progress: 0, holderId: null
  };

  onStart() { this.startTicking(); }

  private startTicking() {
    if (!this.ticker) this.ticker = setInterval(() => this.tick(), 100);
  }

  private broadcast(message: ServerMessage, excluding?: string[]) {
    this.room.broadcast(JSON.stringify(message), excluding);
  }

  private send(connection: Party.Connection, message: ServerMessage) {
    connection.send(JSON.stringify(message));
  }

  private enemies(now: number): EnemyState[] {
    return Array.from({ length: ENEMY_COUNT }, (_, id) => ({
      id, ...enemyPosition(id, now), stunnedUntil: this.enemyStun.get(id) || 0
    }));
  }

  onConnect(connection: Party.Connection) {
    if (this.players.size >= MAX_PLAYERS) {
      this.send(connection, { type: "notice", message: "This room is full. Try a different room code." });
      connection.close(4001, "Room full");
      return;
    }
    this.startTicking();
    const index = this.players.size;
    const spawn = spawnPosition(index);
    const now = Date.now();
    const player: PlayerInternal = {
      id: connection.id, name: `Elf ${String(index + 1).padStart(2, "0")}`,
      color: COLORS[index % COLORS.length], ...spawn, yaw: 0,
      score: 0, stunnedUntil: 0, interacting: false,
      lastMove: now, lastThrow: 0, holdSince: null, invulnerableUntil: now + 2000
    };
    this.players.set(connection.id, player);
    this.send(connection, {
      type: "welcome", id: connection.id,
      players: [...this.players.values()].map(asPublic),
      enemies: this.enemies(now), round: { ...this.round }, serverTime: now
    });
    this.broadcast({ type: "join", player: asPublic(player) }, [connection.id]);
  }

  onMessage(payload: string | ArrayBuffer, sender: Party.Connection) {
    const player = this.players.get(sender.id);
    if (!player || typeof payload !== "string" || payload.length > 400) return;
    let message: ClientMessage;
    try { message = JSON.parse(payload) as ClientMessage; } catch { return; }
    if (!message || typeof message !== "object" || typeof message.type !== "string") return;
    const now = Date.now();

    if (message.type === "rename") {
      if (typeof message.name !== "string") return;
      player.name = safeName(message.name);
      this.broadcast({ type: "rename", id: sender.id, name: player.name });
      return;
    }
    if (this.round.status !== "playing") return;

    if (message.type === "move") {
      if (![message.x, message.y, message.z, message.yaw].every(validNumber)) return;
      const dt = Math.max(0.016, Math.min(0.2, (now - player.lastMove) / 1000));
      if (now - player.lastMove < 20) return; // 30Hz expected; cap traffic from untrusted clients.
      player.lastMove = now;
      const x = Math.max(-WORLD_HALF + 2, Math.min(WORLD_HALF - 2, message.x));
      const z = Math.max(-WORLD_HALF + 2, Math.min(WORLD_HALF - 2, message.z));
      const y = Math.max(0.55, Math.min(4, message.y));
      const dist = Math.hypot(x - player.x, z - player.z);
      if (player.stunnedUntil > now || dist > PLAYER_SPEED * dt + 0.38 || collidesWorld(x, z, 0.25)) {
        this.send(sender, { type: "move", player: asPublic(player), serverTime: now });
        return;
      }
      player.x = x;
      player.y = y;
      player.z = z;
      player.yaw = ((message.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      if (player.holdSince !== null && Math.hypot(x, z) > INTERACTION_RANGE) {
        player.holdSince = null;
        player.interacting = false;
      }
      this.broadcast({ type: "move", player: asPublic(player), serverTime: now }, [sender.id]);
      return;
    }
    if (message.type === "interact") {
      if (typeof message.held !== "boolean") return;
      const canHold = message.held && Math.hypot(player.x, player.z) <= INTERACTION_RANGE && player.stunnedUntil < now;
      player.interacting = canHold;
      player.holdSince = canHold ? (player.holdSince ?? now) : null;
      this.broadcast({ type: "move", player: asPublic(player), serverTime: now });
      return;
    }
    if (message.type === "throw") {
      if (now - player.lastThrow < 700 || player.stunnedUntil > now) return;
      player.lastThrow = now;
      let best: number | null = null;
      let bestDistance = Infinity;
      const fx = Math.sin(player.yaw), fz = -Math.cos(player.yaw);
      for (const enemy of this.enemies(now)) {
        if (enemy.stunnedUntil > now) continue;
        const dx = enemy.x - player.x, dz = enemy.z - player.z;
        const forward = dx * fx + dz * fz;
        const sideways = Math.abs(dx * fz - dz * fx);
        if (forward > 0.6 && forward < 16 && sideways < 1.7 && forward < bestDistance) {
          best = enemy.id;
          bestDistance = forward;
        }
      }
      if (best !== null) this.enemyStun.set(best, now + 4300);
      this.broadcast({
        type: "snowball", id: player.id, x: player.x, y: player.y + 0.7,
        z: player.z, yaw: player.yaw, hitEnemy: best, serverTime: now
      });
      return;
    }
  }

  private tick() {
    const now = Date.now();
    if (!this.players.size) return;
    if (this.round.status === "rescued") {
      if (now >= this.round.resetAt) this.newRound(now);
      else this.broadcast({ type: "round", round: { ...this.round }, serverTime: now });
      return;
    }
    const enemies = this.enemies(now);
    for (const player of this.players.values()) {
      if (player.stunnedUntil > now || player.invulnerableUntil > now) continue;
      for (const enemy of enemies) {
        if (enemy.stunnedUntil > now) continue;
        if (Math.hypot(enemy.x - player.x, enemy.z - player.z) < 1.8) {
          player.stunnedUntil = now + 1800;
          player.invulnerableUntil = now + 3500;
          player.interacting = false;
          player.holdSince = null;
          this.broadcast({ type: "stunned", id: player.id, until: player.stunnedUntil });
          break;
        }
      }
    }
    let leader: PlayerInternal | null = null;
    let progress = 0;
    for (const player of this.players.values()) {
      if (player.holdSince === null || !player.interacting || player.stunnedUntil > now) continue;
      if (Math.hypot(player.x, player.z) > INTERACTION_RANGE) {
        player.holdSince = null;
        player.interacting = false;
        continue;
      }
      const elapsed = now - player.holdSince;
      if (elapsed >= progress) { leader = player; progress = elapsed; }
    }
    this.round.progress = Math.min(1, progress / RESCUE_DURATION_MS);
    this.round.holderId = leader?.id ?? null;
    if (leader && progress >= RESCUE_DURATION_MS) {
      this.round.status = "rescued";
      this.round.winner = leader.id;
      this.round.winnerName = leader.name;
      this.round.resetAt = now + ROUND_RESET_MS;
      leader.score += 1;
      this.broadcast({ type: "move", player: asPublic(leader), serverTime: now });
    }
    this.broadcast({ type: "enemies", enemies, serverTime: now });
    this.broadcast({ type: "round", round: { ...this.round }, serverTime: now });
  }

  private newRound(now: number) {
    this.round = { round: this.round.round + 1, status: "playing", winner: null,
      winnerName: null, resetAt: 0, progress: 0, holderId: null };
    let slot = 0;
    for (const p of this.players.values()) {
      Object.assign(p, spawnPosition(slot++));
      p.yaw = 0;
      p.stunnedUntil = 0;
      p.holdSince = null;
      p.interacting = false;
      p.lastMove = now;
      p.invulnerableUntil = now + 2300;
      this.broadcast({ type: "move", player: asPublic(p), serverTime: now });
    }
    this.enemyStun.clear();
    this.broadcast({ type: "round", round: { ...this.round }, serverTime: now });
  }

  onClose(connection: Party.Connection) { this.removePlayer(connection.id); }
  onError(connection: Party.Connection) { this.removePlayer(connection.id); }

  private removePlayer(id: string) {
    if (!this.players.delete(id)) return;
    this.broadcast({ type: "leave", id });
    if (!this.players.size) {
      clearInterval(this.ticker);
      this.ticker = undefined;
      this.round = { round: 1, status: "playing", winner: null, winnerName: null,
        resetAt: 0, progress: 0, holderId: null };
      this.enemyStun.clear();
    }
  }
}