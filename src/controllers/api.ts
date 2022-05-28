import express, { NextFunction, Request, Response } from "express";
import { sign } from "jsonwebtoken";
import passport from "passport";

import HTTP_Error from "../classes/http_error";
import json_user from "../middleware/json_user";
import Earl from "../models/earl";

const apiRouter = express.Router();

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
function apiUser(req: Request, res: Response) {
  if (res.locals.user.props) {
    const { id, username, createdAt } = res.locals.user.props;

    return res.json({
      success: true,
      user: { id, username, createdAt },
    });
  }

  return res.status(res.locals.user.error.status || 401).json({
    success: false,
    error: res.locals.user.error.message,
  });
}

apiRouter.get("/auth", [json_user], apiUser);

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
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                  user_id:
 *                    type: integer
 *                    description: The user ID.
 *                    example: 1
 *                  token:
 *                    type: string
 *                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2NTMyNjIxODQsImV4cCI6MTY1MzI2MjMwNH0.CfYv0cvtYPuiBs3e61jYs8m23yaak--n0JMnFrDc3O4"
 *        401:
 *          description: Username or password is incorrect
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Username not found"
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

apiRouter.post("/auth/login", api_login);

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
 *           example: "b"
 *      responses:
 *        200:
 *          description: Short URL was found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  id:
 *                    type: integer
 *                    example: 31
 *                  long_url:
 *                    type: string
 *                    example: "https://stackoverflow.com/questions/52694418/error-type-is-not-a-valid-async-function-return-type-in-es5-es3-because-it-does"
 *                  short_url:
 *                    type: string
 *                    example: "https://earlsurls.site/b"
 *                  created:
 *                    type: string
 *                    example: "2022-04-29T23:10:44.902Z"
 *                  user_id:
 *                    type: integer
 *                    example: 1
 *        404:
 *          description: Record does not exist
 *        500:
 *          description: Integer out of bounds
 */
async function apiGet(req: Request, res: Response, next: NextFunction) {
  const short = req.params.short;

  return Earl.get_by_shortid(short)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (earl: ShortEarl) => {
          return res.status(200).json({
            success: true,
            id: row.id,
            long_url: row.url,
            short_url: earl.short_url,
            created: row.createdAt,
            user_id: row.userId,
          });
        }
      );
    })
    .catch((err: HTTP_Error | Error) => {
      if (err instanceof HTTP_Error) {
        return res.status(err.status).json({
          success: false,
          message: err.message,
        });
      }

      return res.json({
        success: false,
        message: err.message,
      });
    });
}

apiRouter.get("/:short", apiGet);

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
async function apiPost(req: Request, res: Response) {
  const inputUrl = req.body.url;
  const userID = res.locals.user.props.id;

  await Earl.insert(inputUrl, userID)
    .then(async (row) => {
      await Earl.get_shortlink(row.id, req.get("Host"), req.secure).then(
        (earl: ShortEarl) => {
          return res.status(201).json({
            success: true,
            id: row.id,
            input_url: inputUrl,
            short_url: earl.short_url,
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
        input_url: inputUrl,
        user_id: userID,
      });
    });
}

apiRouter.post("/", [json_user], apiPost);

apiRouter.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
  });
});

export default apiRouter;
