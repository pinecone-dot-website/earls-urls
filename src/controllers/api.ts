import express, { Request, Response } from "express";
import Earl from "../models/earl";
const api_router = express.Router();

// GET
function api_get(req: Request, res: Response) {
  const short = req.params.short;

  Earl.get_by_shortid(
    short,
    (err) => {
      console.log("err", err);
      res.status(err.code).json({
        success: false,
        message: err.message
      })
    },
    (row) => {
      res.status(200).json({
        success: true,
        id: row.id,
        long_url: row.url,
        short_url: Earl.get_shortlink(row.id, req.get("Host"), req.secure),
      });
    }
  );
}

api_router.get("/:short", api_get);

// POST to /api
async function api_post(req: Request, res: Response) {
  const input_url = req.body?.url;

  Earl.insert(
    input_url,
    0,
    (err: FailResponse) => {
      res.status(err.code).json({
        error: err.message,
        success: false,
      });
    },
    (row) => {
      res.status(200).json({
        input_url: input_url,
        short_url: Earl.get_shortlink(row.id, req.get("Host"), req.secure),
        success: true,
      });
    }
  );
}

api_router.post("/", api_post);

module.exports = {
  api_router,
  api_post,
};
