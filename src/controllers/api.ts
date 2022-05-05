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
 *      security:
 *        - bearerAuth: []
 *      summary: View authenticated user
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Valid JWT
 *        401:
 *          description: Unauthorized
 */
function api_user(req: Request, res: Response) {
  if (req.user.props) {
    const { id, username, createdAt } = req.user.props;

    return res.json({
      success: true,
      user: { id, username, createdAt },
    });
  }

  return res.status(req.user.error.status || 401).json({
    success: false,
    error: req.user.error.message,
  });
}

api_router.get("/auth", [json_user], api_user);

/**
 * @swagger
 *  /api/auth/login:
 *    post:
 *      summary: Log in and receive JWT
 *      consumes:
 *      - "application/json"
 *      produces:
 *      - "application/json"
 *      requestBody:
 *        description: The user to log in
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              required:
 *                - "username"
 *                - "password"
 *              properties:
 *                username:
 *                  example: demo1
 *                  type: string
 *                password:
 *                  example: password1
 *                  type: string
 *      responses:
 *        200:
 *          description: Successful login
 *        401:
 *          description: Username or password is incorrect
 */
function api_login(req: Request, res: Response) {
  const verified = (err: HTTP_Error, user, info) => {
    const cb = (err: Error, encoded: string) => {
      if (err) {
        return res.json({
          success: false,
          error: err.message,
        });
      }

      return res.json({
        success: true,
        user_id: user.id,
        token: encoded,
      });
    };

    if (err) {
      return res.status(err.status).json({
        success: false,
        error: err.message,
      });
    } else if (!user) {
      // no credentials
      return res.status(401).json({
        success: false,
        error: info.message,
      });
    }

    sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: 120 }, cb);
  };

  passport.authenticate("local", verified)(req, res);
}

api_router.post("/auth/login", api_login);

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
 *           example: "a"
 *      responses:
 *        200:
 *          description: Short URL was found
 *        404:
 *          description: Record does not exist
 *        500:
 *          description: Integer out of bounds
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
 *      security:
 *        - bearerAuth: []
 *      summary: Shorten a URL
 *      consumes:
 *        - "application/json"
 *      produces:
 *        - "application/json"
 *      requestBody:
 *          description: The url to shorten
 *          content:
 *            application/json:
 *              schema:
 *                required:
 *                  - url
 *                properties:
 *                  url:
 *                    example: https://earlsurls.site
 *                    type: string
 *      responses:
 *        201:
 *          description: Success
 *        400:
 *          description: Server Error
 *        422:
 *          description: Invalid URL
 *        500:
 *          description: Error in convertion
 */
async function api_post(req: Request, res: Response) {
  const input_url = req.body.url;
  const user_id = req.user.props.id;

  await Earl.insert(input_url, user_id)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (short_url) => {
          return res.status(201).json({
            success: true,
            id: row.id,
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
        success: false,
        error: err.message,
        input_url: input_url,
        user_id: user_id,
      });
    });
}

api_router.post("/", [json_user], api_post);

module.exports = api_router;
