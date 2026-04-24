import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const http = host.switchToHttp();
        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();

        if (exception instanceof ZodValidationException) {
            const zodError = exception.getZodError() as ZodError;
            const combinedMessage = zodError.issues
                .map((e) => {
                    const field = e.path
                        .filter((p): p is string | number => typeof p === "string" || typeof p === "number")
                        .join(".");

                    return field ? `${field}: ${e.message}` : e.message;
                })
                .join("\n");

            return response.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: HttpStatus.BAD_REQUEST,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: {
                    message: combinedMessage,
                    error: "Bad Request",
                    statusCode: HttpStatus.BAD_REQUEST,
                },
            });
        }

        const status = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';
        this.logger.error(
            `${request.method} ${request.url}`,
            exception instanceof Error ? exception.stack : exception,
        );
        console.error("🔥 OBJECT LỖI GỐC ĐỂ DEBUG:", exception);
        return response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message
        });

    }
}