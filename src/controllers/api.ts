import express, { Request, Response } from "express";
import Earl from "../models/earl";
const api_router = express.Router();

// GET
async function api_get(req: Request, res: Response) {
  const short = req.params.short;

  await Earl.get_by_shortid(short)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(200).json({
            success: true,
            id: row.id,
            long_url: row.url,
            short_url: short_url,
            created: row.createdAt,
          });
        }
      );
    })
    .catch((err) => {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    });
}

api_router.get("/:short", api_get);

// POST to /api
async function api_post(req: Request, res: Response) {
  const input_url = req.body?.url;

  await Earl.insert(input_url, 0)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(200).json({
            input_url: input_url,
            short_url: short_url,
            success: true,
          });
        }
      );
    })
    .catch((err) => {
      console.log('api_post err',err);
      return res.status(err.status).json({
        error: err.message,
        success: false,
      });
    });
}

api_router.post("/", api_post);

module.exports = {
  api_router,
  api_post,
};
