import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    resolve: {
        alias: {
            "@lib": resolve(__dirname, "lib"),
        }
    }
})