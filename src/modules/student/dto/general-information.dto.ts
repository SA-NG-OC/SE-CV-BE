import z from 'zod'
import { createZodDto } from 'nestjs-zod'

export const generalInformationSchema = z.object({
    totalStudents: z
        .number({ message: 'Dữ liệu trả về không đúng định dạng' })
        .min(0, { message: 'Tổng số sinh viên không thể âm' }),

    studying: z
        .number({ message: 'Dữ liệu trả về không đúng định dạng' })
        .min(0, { message: 'Tổng số sinh viên không thể âm' }),

    graduated: z
        .number({ message: 'Dữ liệu trả về không đúng định dạng' })
        .min(0, { message: 'Tổng số sinh viên không thể âm' }),
});

export class GeneralInformationDto extends createZodDto(generalInformationSchema) { }