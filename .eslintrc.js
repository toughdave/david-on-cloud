module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "script"
    },
    rules: {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "no-unused-vars": ["warn"],
        "no-console": ["warn"],
        "no-debugger": ["error"],
        "prefer-const": ["warn"],
        "no-var": ["error"],
        "no-undef": ["warn"]
    },
    globals: {
        "AOS": "readonly",
        "VANTA": "readonly",
        "feather": "readonly",
        "fetch": "readonly",
        "carousel": "writable"
    }
};