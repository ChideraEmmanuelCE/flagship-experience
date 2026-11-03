import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import RescueSantaRoom from './party/server';

const PORT = Number(process.env.PORT || 1999);
const rooms = new Map<string, { controller: RescueSantaRoom; sockets: Map<string, WebSocket> }>();

const wss = new WebSocketServer({ noServer: true, maxPayload: 2048 });
const server = http.createServer((req, res) => {
  if (req.url?.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    res.end(JSON.stringify({ ok: true, service: 'rescue-santa-realtime', rooms: rooms.size }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Rescue Santa realtime WebSocket server');
});
server.on('upgrade', (req, socket, head) => {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  if (!/^\/parties\/main\/[a-z0-9-]{1,24}$/i.test(path)) {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
wss.on('connection', (socket, request) => {
  const roomName = new URL(request.url || '/', 'http://localhost').pathname.split('/').pop()!;
  let game = rooms.get(roomName);
  if (!game) {
    const sockets = new Map<string, WebSocket>();
    const roomFacade = {
      id: roomName,
      broadcast: (payload: string, except: string[] = []) => {
        for (const [id, peer] of sockets) {
          if (!except.includes(id) && peer.readyState === WebSocket.OPEN) peer.send(payload);
        }
      }
    };
    const controller = new RescueSantaRoom(roomFacade as never);
    controller.onStart();
    game = { controller, sockets };
    rooms.set(roomName, game);
  }
  const currentGame = game;
  const id = randomUUID();
  currentGame.sockets.set(id, socket);
  const connection = {
    id,
    send: (payload: string) => { if (socket.readyState === WebSocket.OPEN) socket.send(payload); },
    close: (code?: number, reason?: string) => socket.close(code, reason)
  };
  currentGame.controller.onConnect(connection as never);
  socket.on('message', (buffer, isBinary) => {
    if (isBinary) return;
    currentGame.controller.onMessage(buffer.toString(), connection as never);
  });
  socket.on('close', () => {
    currentGame.controller.onClose(connection as never);
    currentGame.sockets.delete(id);
    if (!currentGame.sockets.size) {
      rooms.delete(roomName);
    }
  });
  socket.on('error', () => { /* close event handles removal */ });
});
server.listen(PORT, '0.0.0.0', () => console.log(`Rescue Santa realtime server listening on :${PORT}`));
