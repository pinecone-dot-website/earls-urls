import express, { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import passport from "passport";

import HTTP_Error from "../classes/http_error";
import json_user from "../middleware/json_user";
import Earl from "../models/earl";
const api_router = express.Router();

// POST for auth login with jwt
function api_auth(req: Request, res: Response) {
}

api_router.post("/auth/login", api_auth);

// GET user information
function api_user(req: Request, res: Response) {
}

api_router.get("/auth", api_user);

// GET long url from short
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
    .catch((err: HTTP_Error) => {
      return res.status(err.status).json({
        success: false,
        message: err.message,
      });
    });
}

api_router.get("/:short", api_get);

// POST long url and receive short
async function api_post(req: Request, res: Response) {
  const input_url = req.body?.url;

  await Earl.insert(input_url, 0)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(200).json({
            success: true,
            input_url: input_url,
            short_url: short_url,
            created: row.createdAt,
          });
        }
      );
    })
    .catch((err) => {
      console.log("api_post err", err);
      return res.status(err.status).json({
        error: err.message,
        success: false,
      });
    });
}

api_router.post("/", [json_user], api_post);

module.exports = api_router;
