import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3"

dotenv.config()

const s3 = new S3Client({
    region: "ams3",
    endpoint: "https://ams3.digitaloceanspaces.com",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

export async function uploadToS3(filePathOrUrl: string, awsKey?: string): Promise<string> {
    let fileContent: Buffer
    let fileName: string

    // Проверяем — это URL или локальный путь
    const isUrl = /^https?:\/\//i.test(filePathOrUrl)

    if (isUrl) {
        // Загружаем файл по URL
        const response = await fetch(filePathOrUrl)
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке файла по URL: ${response.statusText}`)
        }
        fileContent = Buffer.from(await response.arrayBuffer())

        // Пытаемся извлечь имя файла из URL
        const urlParts = new URL(filePathOrUrl)
        fileName = path.basename(urlParts.pathname) || `image-${Date.now()}.jpg`
    } else {
        // Загружаем локальный файл
        fileContent = await fs.promises.readFile(filePathOrUrl)
        fileName = path.basename(filePathOrUrl)
    }

    const key = `${awsKey || "uploads"}/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
        Bucket: "project-d",
        Key: key,
        Body: fileContent,
        ACL: "public-read",
        ContentType: "image/jpeg"
    })

    try {
        await s3.send(command)
        return `https://project-d.ams3.digitaloceanspaces.com/${key}`
    } catch (err) {
        console.error("Ошибка загрузки в S3:", err)
        throw err
    }
}