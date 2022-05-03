import express, { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import passport from "passport";

import HTTP_Error from "../classes/http_error";
import json_user from "../middleware/json_user";
import Earl from "../models/earl";
import User from "../models/user";

const api_router = express.Router();

/**
 * @swagger
 *  /api/auth:
 *    get:
 *      summary: View authenticated user
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Yes
 */
function api_user(req: Request, res: Response) {
  if (req.user) {
    const { id, username, createdAt } = req.user;

    return res.json({
      success: true,
      user: { id, username, createdAt },
    });
  }

  return res.status(req.user_error.status || 401).json({
    success: false,
    message: req.user_error.message,
  });
}

api_router.get("/auth", [json_user], api_user);

/**
 * @swagger
 *  /api/login:
 *    post:
 *      summary: Log in and receive JWT
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Yes
 */
function api_auth(req: Request, res: Response) {
  User.login(req.body.username, req.body.password)
    .then((user_id) => {
      console.log("user_id", user_id);
      const token = sign(
        {
          user_id: user_id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 1000000,
        }
      );

      return res.json({
        success: true,
        user_id: user_id,
        token,
      });
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(err.status).json({
        success: false,
        error: err.message,
      });
    });
}

api_router.post("/auth/login", api_auth);

/**
 * @swagger
 *  /api/{id}:
 *    get:
 *      summary: Gets information about a short url
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: slug of the short url.
 *         schema:
 *           type: string
 *      responses:
 *        200:
 *          description: Short URL was found
 */
async function api_get(req: Request, res: Response) {
  const short = req.params.short;

  Earl.get_by_shortid(short)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(200).json({
            success: true,
            id: row.id,
            long_url: row.url,
            short_url: short_url,
            created: row.createdAt,
            user_id: row.userId,
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

/**
 * @swagger
 *  /api/:
 *    post:
 *      summary: Shorten a URL
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                url:
 *                  type: string
 *                  description: url to shorten
 *                  example: "https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do"
 *    responses:
 *      422:
 *        description: Invalid URL
 */
async function api_post(req: Request, res: Response) {
  const input_url = req.body?.url;
  const user_id = req.user?.id;

  await Earl.insert(input_url, user_id)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(200).json({
            success: true,
            input_url: input_url,
            short_url: short_url,
            created: row.createdAt,
            user_id: row.userId,
          });
        }
      );
    })
    .catch((err) => {
      return res.status(err.status || 422).json({
        error: err.message,
        success: false,
      });
    });
}

api_router.post("/", [json_user], api_post);

module.exports = api_router;
