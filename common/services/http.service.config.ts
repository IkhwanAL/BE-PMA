import { Response } from 'express';
import { FailedTypes } from '../@types/failed.types';
import { SuccessType } from '../@types/success.types';

export class HttpResponse {
    /**
     * 200 Status
     * @param res Response
     * @param data any
     * @returns
     */
    public static Ok(res: Response, data: any, message?: string) {
        return res.status(200).send({
            message: message ? message : 'Sukses',
            status: 200,
            sukses: true,
            data: data,
        } as SuccessType);
    }

    /**
     * 201 Created
     * @param res Response
     * @param data any
     * @returns
     */
    public static Created(res: Response, data: any, message?: string) {
        return res.status(201).send({
            message: message ? message : 'Sukses Membuat',
            status: 201,
            sukses: true,
            data: data,
        } as SuccessType);
    }
    /**
     * 204 No Content Not Returning Data Inside Object
     * @param res Response
     * @returns
     */
    public static NoContent(res: Response, message?: string) {
        return res.status(204).send({
            message: message ? message : 'Sukses',
            status: 204,
            sukses: true,
        } as SuccessType);
    }

    /**
     * 400 Bad Request
     * @param res Response
     * @returns
     */
    public static BadRequest(res: Response, message?: string) {
        return res.status(400).send({
            message: message ? message : 'Gagal, Penerimaan Data',
            status: 400,
            sukses: false,
        } as FailedTypes);
    }

    /**
     * 401 Unauthorized Access
     * @param res Response
     * @returns
     */
    public static Unauthorized(res: Response, message?: string) {
        return res.status(401).send({
            message: message ? message : 'Gagal, Tidak memiliki Akses',
            status: 401,
            sukses: false,
        } as FailedTypes);
    }

    /**
     * 403 Forbidden To Akses The Location
     * @param res Response
     * @returns
     */
    public static Forbidden(res: Response, message?: string) {
        return res.status(403).send({
            message: message ? message : 'Gagal, Tidak ada akses',
            status: 403,
            sukses: false,
        } as FailedTypes);
    }

    /**
     * 404 NotFound
     * @param res
     * @returns
     */
    public static NotFound(res: Response, data?: any, message?: string) {
        return res.status(404).send({
            message: message ? message : 'Gagal, Tidak Di Temukan',
            status: 404,
            sukses: false,
            data: data,
        } as FailedTypes);
    }

    /**
     * 409 Confilct
     * @param res
     * @returns
     */
    public static Confilct(res: Response, message?: string) {
        return res.status(409).send({
            message: message
                ? message
                : 'Gagal, Terjadi Konflik\n Mohon Untuk diulang beberapa saat',
            status: 409,
            sukses: false,
        } as FailedTypes);
    }

    /**
     * 500 Internal Server Error
     * @param res
     */
    public static InternalServerError(res: Response, message?: string) {
        return res.status(500).send({
            message: message ? message : 'Gagal, Terjadi Kesalahan Pada Server',
            status: 500,
            sukses: false,
        } as FailedTypes);
    }

    /**
     * 503 Service Unavailable
     * @param res
     */
    public static ServiceUnavailable(res: Response, message?: string) {
        return res.status(503).send({
            message: message ? message : 'Gagal, Website Sedang Maintance',
            status: 500,
            sukses: false,
        } as FailedTypes);
    }
}
