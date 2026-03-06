/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        '@tailwindcss/postcss': {}, // แก้เป็นชื่อนี้
        autoprefixer: {},
    },
};

export default config;