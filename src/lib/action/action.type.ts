export type ErrorActionResult = {
  success: false;
  message: string;
  errors?: Record<string, unknown>; //Key เป็น string ,Value เป็น unknown
  code: string;
};
