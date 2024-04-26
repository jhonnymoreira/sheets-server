/** @type {import('lint-staged').Config} */
const config = {
  '**/*': 'prettier --write --ignore-unknown',
};

export default config;
