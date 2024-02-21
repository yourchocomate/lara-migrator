import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    resolve: {
        alias: {
            "@lib": resolve(__dirname, "lib"),
        }
    }
})