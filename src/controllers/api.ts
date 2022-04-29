import express, { Request, Response } from "express";
import Earl from "../models/earl";
const api_router = express.Router();

// post to /api
async function api_post(req: Request, res: Response) {
  const input_url = req.body?.url;

  Earl.insert(
    input_url,
    0,
    (err:FailResponse) => {
      res.status(err.code).json({
        error: err.message,
        success: false,
      });
    },
    (id) => {
      res.status(200).json({
        input_url: input_url,
        short_url: Earl.get_shortlink(id, req.get("Host"), req.secure),
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
