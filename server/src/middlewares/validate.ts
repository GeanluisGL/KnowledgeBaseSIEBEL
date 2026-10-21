import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/** Valida req.body con un schema de Zod. Si es válido, reemplaza req.body por los datos ya parseados. */
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
