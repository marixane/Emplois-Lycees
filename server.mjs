import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import cahierPdfHandler from './api/cahier-pdf.js';

const PORT = Number(process.env.PORT || 5175);
const MAX_BODY_SIZE = 20 * 1024 * 1024;

const readJsonBody = async (req) => {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      const error = new Error('Document trop grand pour générer le PDF');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const addVercelResponseHelpers = (res) => {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };

  res.json = (value) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(value));
    return res;
  };

  res.send = (value) => {
    res.end(value);
    return res;
  };

  return res;
};

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa'
});

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `localhost:${PORT}`}`);

    if (requestUrl.pathname === '/api/cahier-pdf') {
      addVercelResponseHelpers(res);

      if (req.method === 'POST') {
        try {
          req.body = await readJsonBody(req);
        } catch (error) {
          return res.status(error.statusCode || 400).json({
            error: error.statusCode === 413 ? error.message : 'Requête PDF invalide'
          });
        }
      }

      return await cahierPdfHandler(req, res);
    }

    vite.middlewares(req, res, (error) => {
      if (error) {
        console.error(error);
        if (!res.headersSent) res.statusCode = 500;
        res.end('Erreur du serveur local');
      }
    });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.statusCode = 500;
    res.end('Erreur du serveur local');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Application disponible sur http://localhost:${PORT}`);
  console.log('Le téléchargement PDF local est actif.');
});
