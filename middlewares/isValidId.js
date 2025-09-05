import { isValidObjectId } from "mongoose";

import { HttpError } from "../helpers/index.js";

const isValidId = (req, _, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(HttpError(404, `${id} is not valid ID`));
  }
  next();
};

export default isValidId;
